using GymApp.Api.Data;
using GymApp.Api.DTOs.Memberships;
using GymApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GymApp.Api.Services.Memberships;

/// <summary>
/// Сервис для работы с абонементами.
/// Содержит всю бизнес-логику: расчёт дат, автозакрытие старых абонементов,
/// проверка истёкших абонементов при посещении.
/// 
/// ═══════════════════════════════════════════════════════════════
/// БИЗНЕС-ПРАВИЛА:
/// ═══════════════════════════════════════════════════════════════
/// 
/// 1. Создание:
///    - single: total_visits=1, end_date=start_date+30 дней
///    - month:  total_visits=0, end_date=start_date+30 дней
///    - year:   total_visits=0, end_date=start_date+365 дней
///    - Если у клиента есть активный абонемент → закрываем его (status='completed')
/// 
/// 2. Обновление:
///    - Разрешено менять только Status (для ЧП) и EndDate (для исправлений)
///    - EndDate >= StartDate абонемента (проверяется здесь, не в валидаторе)
/// 
/// 3. Удаление:
///    - Запрещено, если есть посещения (ON DELETE RESTRICT в БД)
/// 
/// 4. Проверка статуса при посещении:
///    - Если status='active' и end_date < сегодня → status='expired'
///    - Вызывается из VisitService
/// </summary>
public class MembershipService : IMembershipService
{
    private readonly GymDbContext _context;

    /// <summary>
    /// Конструктор. Зависимости внедряются через DI.
    /// </summary>
    public MembershipService(GymDbContext context)
    {
        _context = context;
    }
    /// <inheritdoc/>
    public async Task<MembershipResponseDto> GetByIdAsync(int id)
    {
        // Ищем абонемент по ID. Если не найден — бросаем исключение.
        var membership = await _context.Memberships
            .Where(m => m.Id == id)
            .Select(m => new MembershipResponseDto
            {
                Id = m.Id,
                ClientId = m.ClientId,
                ClientFullName = (m.Client.LastName + " " + m.Client.FirstName + " " +
                                 (m.Client.Patronymic ?? "")).Trim(),
                Type = m.Type,
                StartDate = m.StartDate,
                EndDate = m.EndDate,
                TotalVisits = m.TotalVisits,
                UsedVisits = m.UsedVisits,
                Status = m.Status
            })
            .FirstOrDefaultAsync();

        if (membership == null)
        {
            throw new KeyNotFoundException($"Абонемент с ID {id} не найден");
        }

        return membership;
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<MembershipResponseDto>> GetAllAsync(int? clientId = null, string? status = null)
    {
        // Начинаем с базового запроса (данные ещё не загружены из БД!)
        // Это IQueryable — мы можем динамически добавлять условия.
        var query = _context.Memberships.AsQueryable();

        // Если передан clientId, добавляем условие WHERE client_id = @clientId
        if (clientId.HasValue)
        {
            query = query.Where(m => m.ClientId == clientId.Value);
        }

        // Если передан status, добавляем условие WHERE status = @status
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(m => m.Status == status);
        }

        // Делаем JOIN с clients и маппим в DTO прямо в SQL
        var result = await query
            .OrderByDescending(m => m.StartDate) // Сортируем по дате начала (новые сверху)
            .Select(m => new MembershipResponseDto
            {
                Id = m.Id,
                ClientId = m.ClientId,
                ClientFullName = (m.Client.LastName + " " + m.Client.FirstName + " " +
                                 (m.Client.Patronymic ?? "")).Trim(),
                Type = m.Type,
                StartDate = m.StartDate,
                EndDate = m.EndDate,
                TotalVisits = m.TotalVisits,
                UsedVisits = m.UsedVisits,
                Status = m.Status
            })
            .ToListAsync();

        return result;
    }

    /// <inheritdoc/>
    public async Task<MembershipResponseDto> CreateAsync(CreateMembershipDto dto)
    {
        // ═══════════════════════════════════════════════════════════════
        // ШАГ 1: Проверяем существование клиента
        // ═══════════════════════════════════════════════════════════════
        var clientExists = await _context.Clients.AnyAsync(c => c.Id == dto.ClientId && !c.IsDeleted);
        if (!clientExists)
        {
            throw new KeyNotFoundException($"Клиент с ID {dto.ClientId} не найден");
        }

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 2: Автоматически закрываем старый активный абонемент клиента
        // ═══════════════════════════════════════════════════════════════
        // Если у клиента уже есть активный абонемент, закрываем его.
        // Статус → 'completed' (ценность переходит в новый абонемент).
        var existingActive = await _context.Memberships
            .FirstOrDefaultAsync(m => m.ClientId == dto.ClientId && m.Status == "active");

        if (existingActive != null)
        {
            existingActive.Status = "completed";
            // Не вызываем SaveChangesAsync() здесь — сделаем это после создания нового абонемента
        }

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 3: Рассчитываем EndDate и TotalVisits на основе типа
        // ═══════════════════════════════════════════════════════════════
        DateTime endDate;
        int totalVisits;

        switch (dto.Type)
        {
            case "single":
                endDate = dto.StartDate.AddDays(30); // Разовый: действует 30 дней
                totalVisits = 1;                      // Лимит: 1 посещение
                break;
            case "month":
                endDate = dto.StartDate.AddMonths(1); // Месячный: +30 дней
                totalVisits = 0;                      // Безлимит
                break;
            case "year":
                endDate = dto.StartDate.AddYears(1);  // Годовой: +365 дней
                totalVisits = 0;                      // Безлимит
                break;
            default:
                // Этот случай не должен произойти (валидатор проверяет тип),
                // но на всякий случай бросаем исключение.
                throw new InvalidOperationException($"Неизвестный тип абонемента: {dto.Type}");
        }

        //Явно указываем DateTimeKind.Utc для драйвера PostgreSQL
        var startDateUtc = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
        var endDateUtc = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 4: Создаём новый абонемент
        // ═══════════════════════════════════════════════════════════════
        var membership = new Membership
        {
            ClientId = dto.ClientId,
            Type = dto.Type,
            StartDate = startDateUtc,  //dto.StartDate
            EndDate = endDateUtc,       //dto.EndDate
            TotalVisits = totalVisits,
            UsedVisits = 0,
            Status = "active"
        };

        _context.Memberships.Add(membership);

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 5: Сохраняем изменения в БД (один вызов SaveChangesAsync)
        // ═══════════════════════════════════════════════════════════════
        // Это атомарная операция: либо оба изменения применятся, либо ни одно.
        await _context.SaveChangesAsync();

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 6: Возвращаем созданный абонемент в виде DTO
        // ═══════════════════════════════════════════════════════════════
        // После SaveChangesAsync у membership уже есть Id (сгенерирован БД).
        return await GetByIdAsync(membership.Id);
    }

    /// <inheritdoc/>
    public async Task<MembershipResponseDto> UpdateAsync(int id, UpdateMembershipDto dto)
    {
        // ═══════════════════════════════════════════════════════════════
        // ШАГ 1: Ищем абонемент по ID
        // ═══════════════════════════════════════════════════════════════
        var membership = await _context.Memberships.FindAsync(id);
        if (membership == null)
        {
            throw new KeyNotFoundException($"Абонемент с ID {id} не найден");
        }

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 2: Обновляем Status (если передан)
        // ═══════════════════════════════════════════════════════════════
        if (!string.IsNullOrEmpty(dto.Status))
        {
            // Проверяем, что статус допустимый (валидатор уже проверил, но на всякий случай)
            if (dto.Status != "active" && dto.Status != "cancelled")
            {
                throw new InvalidOperationException(
                    $"Нельзя изменить статус на '{dto.Status}'. " +
                    "Разрешены только 'active' и 'cancelled'. " +
                    "Статусы 'completed' и 'expired' устанавливаются автоматически."
                );
            }

            membership.Status = dto.Status;
        }

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 3: Обновляем EndDate (если передана)
        // ═══════════════════════════════════════════════════════════════
        if (dto.EndDate.HasValue)
        {
            // Проверяем, что EndDate >= StartDate абонемента
            if (dto.EndDate.Value.Date < membership.StartDate.Date)
            {
                throw new InvalidOperationException(
                    $"Дата окончания ({dto.EndDate.Value:yyyy-MM-dd}) не может быть раньше " +
                    $"даты начала ({membership.StartDate:yyyy-MM-dd})"
                );
            }

            membership.EndDate = dto.EndDate.Value;
        }

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 4: Сохраняем изменения
        // ═══════════════════════════════════════════════════════════════
        await _context.SaveChangesAsync();

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 5: Возвращаем обновлённый абонемент
        // ═══════════════════════════════════════════════════════════════
        return await GetByIdAsync(id);
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(int id)
    {
        // ═══════════════════════════════════════════════════════════════
        // ШАГ 1: Ищем абонемент по ID
        // ═══════════════════════════════════════════════════════════════
        var membership = await _context.Memberships.FindAsync(id);
        if (membership == null)
        {
            throw new KeyNotFoundException($"Абонемент с ID {id} не найден");
        }

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 2: Проверяем, есть ли посещения у этого абонемента
        // ═══════════════════════════════════════════════════════════════
        var hasVisits = await _context.Visits.AnyAsync(v => v.MembershipId == id);
        if (hasVisits)
        {
            throw new InvalidOperationException(
                "Нельзя удалить абонемент, у которого есть история посещений. " +
                "Используйте отмену (status='cancelled') вместо удаления."
            );
        }

        // ═══════════════════════════════════════════════════════════════
        // ШАГ 3: Удаляем абонемент
        // ═══════════════════════════════════════════════════════════════
        _context.Memberships.Remove(membership);
        await _context.SaveChangesAsync();
    }

    /// <inheritdoc/>
    public async Task CheckAndUpdateStatusAsync(Membership membership)
    {
        // Если абонемент active, но дата прошла — считаем его expired
        if (membership.Status == "active" && membership.EndDate.Date < DateTime.Now.Date)
        {
            membership.Status = "expired";
            await _context.SaveChangesAsync();
        }
    }
}

