using GymApp.Api.Data;
using GymApp.Api.DTOs.Visits;
using GymApp.Api.Models;
using GymApp.Api.Services.Memberships;
using Microsoft.EntityFrameworkCore;

namespace GymApp.Api.Services.Visits;

/// <summary>
/// Сервис для работы с посещениями.
/// Содержит всю бизнес-логику: проверка статуса абонемента, списание посещений,
/// автоматическое закрытие абонемента при достижении лимита.
/// 
/// ═══════════════════════════════════════════════════════════════
/// БИЗНЕС-ПРАВИЛА:
/// ═══════════════════════════════════════════════════════════════
/// 
/// 1. Регистрация посещения:
///    - Проверяем существование абонемента
///    - Вызываем CheckAndUpdateStatusAsync (автообновление статуса на 'expired')
///    - Проверяем статус абонемента (должен быть 'active')
///    - Проверяем лимит посещений (для single: used_visits < total_visits)
///    - Создаём запись в visits (visit_time = DateTime.Now)
///    - Увеличиваем used_visits на 1
///    - Если used_visits == total_visits → статус абонемента = 'completed'
/// 
/// 2. Посещения нельзя редактировать или удалять (исторические данные).
///    В БД есть триггер, который защищает поля membership_id и visit_time.
/// 
/// 3. Чтение посещений:
///    - Поддержка фильтрации по membershipId
///    - В ответе присутствуют ClientFullName, MembershipType, TrainerName (через JOIN)
/// </summary>
public class VisitService : IVisitService
{
    private readonly GymDbContext _context;
    private readonly IMembershipService _membershipService;

    /// <summary>
    /// Конструктор. Зависимости внедряются через DI.
    /// 
    /// VisitService зависит от:
    /// - GymDbContext (для работы с БД)
    /// - IMembershipService (для вызова CheckAndUpdateStatusAsync)
    /// 
    /// Это пример работы с несколькими сервисами через DI.
    /// </summary>
    public VisitService(GymDbContext context, IMembershipService membershipService)
    {
        _context = context;
        _membershipService = membershipService;
    }
    /// <inheritdoc/>
    public async Task<VisitResponseDto> GetByIdAsync(int id)
    {
        // Ищем посещение по ID. Если не найдено — бросаем исключение.
        // Используем Select для эффективного чтения (загружаем только нужные поля + JOIN).
        var visit = await _context.Visits
            .Where(v => v.Id == id)
            .Select(v => new VisitResponseDto
            {
                Id = v.Id,
                MembershipId = v.MembershipId,
                ClientFullName = (v.Membership.Client.LastName + " " +
                                 v.Membership.Client.FirstName + " " +
                                 (v.Membership.Client.Patronymic ?? "")).Trim(),
                MembershipType = v.Membership.Type,
                TrainerId = v.TrainerId,
                TrainerName = v.Trainer != null
                    ? (v.Trainer.LastName + " " + v.Trainer.FirstName + " " +
                       (v.Trainer.Patronymic ?? "")).Trim()
                    : null,
                ProcessedByUserId = v.ProcessedByUserId,
                VisitTime = v.VisitTime
            })
            .FirstOrDefaultAsync();

        if (visit == null)
        {
            throw new KeyNotFoundException($"Посещение с ID {id} не найдено");
        }

        return visit;
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<VisitResponseDto>> GetAllAsync(int? membershipId = null)
    {
        // Начинаем с базового запроса (данные ещё не загружены из БД!)
        var query = _context.Visits.AsQueryable();

        // Если передан membershipId, добавляем условие WHERE membership_id = @membershipId
        if (membershipId.HasValue)
        {
            query = query.Where(v => v.MembershipId == membershipId.Value);
        }

        // Делаем JOIN с memberships, clients, employees и маппим в DTO прямо в SQL
        var result = await query
            .OrderByDescending(v => v.VisitTime) // Сортируем по времени (новые сверху)
            .Select(v => new VisitResponseDto
            {
                Id = v.Id,
                MembershipId = v.MembershipId,
                ClientFullName = (v.Membership.Client.LastName + " " +
                                 v.Membership.Client.FirstName + " " +
                                 (v.Membership.Client.Patronymic ?? "")).Trim(),
                MembershipType = v.Membership.Type,
                TrainerId = v.TrainerId,
                TrainerName = v.Trainer != null
                    ? (v.Trainer.LastName + " " + v.Trainer.FirstName + " " +
                       (v.Trainer.Patronymic ?? "")).Trim()
                    : null,
                ProcessedByUserId = v.ProcessedByUserId,
                VisitTime = v.VisitTime
            })
            .ToListAsync();

        return result;
    }

    /// <inheritdoc/>
    public async Task<VisitResponseDto> CreateAsync(CreateVisitDto dto)
    {
        // ═══════════════════════════════════════════════════════════════
        // ШАГ 1: Загружаем абонемент из БД
        // ═══════════════════════════════════════════════════════════════
        // Используем FindAsync, потому что будем менять объект (used_visits, status).
        var membership = await _context.Memberships.FindAsync(dto.MembershipId);
        if (membership == null)
        {
            throw new KeyNotFoundException($"Абонемент с ID {dto.MembershipId} не найден");
        }

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 2: Вызываем CheckAndUpdateStatusAsync из MembershipService
        // ═══════════════════════════════════════════════════════════════
        // Это автоматически обновит статус на 'expired', если дата прошла.
        // После этого проверяем, что статус = 'active'.
        await _membershipService.CheckAndUpdateStatusAsync(membership);

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 3: Проверяем статус абонемента
        // ═══════════════════════════════════════════════════════════════
        if (membership.Status != "active")
        {
            throw new InvalidOperationException(
                $"Нельзя зарегистрировать посещение: абонемент в статусе '{membership.Status}'. " +
                "Абонемент должен быть активен."
            );
        }

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 4: Проверяем лимит посещений (для single) и Существование тренера
        // ═══════════════════════════════════════════════════════════════
        // Если total_visits > 0 (single), проверяем, что used_visits < total_visits.
        // Для month/year total_visits = 0 (безлимит), проверка не нужна.
        if (membership.TotalVisits > 0 && membership.UsedVisits >= membership.TotalVisits)
        {
            throw new InvalidOperationException(
                $"Лимит посещений исчерпан. Использовано: {membership.UsedVisits} из {membership.TotalVisits}."
            );
        }

       
        if (dto.TrainerId.HasValue)
        {
            var trainerExists = await _context.Employees.AnyAsync(e => e.Id == dto.TrainerId && e.IsActive);
            if (!trainerExists)
            {
                throw new InvalidOperationException($"Тренер с ID {dto.TrainerId} не найден или неактивен");
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 5: Создаём запись в visits
        // ═══════════════════════════════════════════════════════════════
        var visit = new Visit
        {
            MembershipId = membership.Id,
            TrainerId = dto.TrainerId,
            ProcessedByUserId = dto.ProcessedByUserId,
            VisitTime = DateTime.Now // Текущее время
        };

        _context.Visits.Add(visit);

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 6: Увеличиваем used_visits
        // ═══════════════════════════════════════════════════════════════
        membership.UsedVisits++;

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 7: Если лимит достигнут → статус = 'completed'
        // ═══════════════════════════════════════════════════════════════
        // Если total_visits > 0 (single) и used_visits == total_visits → закрываем абонемент.
        if (membership.TotalVisits > 0 && membership.UsedVisits == membership.TotalVisits)
        {
            membership.Status = "completed";
        }

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 8: Сохраняем изменения в БД (один вызов SaveChangesAsync)
        // ═══════════════════════════════════════════════════════════════
        // Это атомарная операция: либо все изменения применятся, либо ни одно.
        await _context.SaveChangesAsync();

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 9: Возвращаем созданное посещение в виде DTO
        // ═══════════════════════════════════════════════════════════════
        // После SaveChangesAsync у visit уже есть Id (сгенерирован БД).
        return await GetByIdAsync(visit.Id);
    }
}
