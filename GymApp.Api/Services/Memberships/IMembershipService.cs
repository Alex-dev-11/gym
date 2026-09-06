using GymApp.Api.DTOs.Memberships;
using GymApp.Api.Models;
namespace GymApp.Api.Services.Memberships;

/// <summary>
/// Интерфейс сервиса для работы с абонементами.
/// Содержит всю бизнес-логику: расчёт дат, автозакрытие старых абонементов,
/// проверка истёкших абонементов при посещении.
/// </summary>
public interface IMembershipService
{
    /// <summary>
    /// Получить абонемент по ID.
    /// </summary>
    Task<MembershipResponseDto> GetByIdAsync(int id);

    /// <summary>
    /// Получить все абонементы с опциональной фильтрацией.
    /// </summary>
    /// <param name="clientId">Фильтр по ID клиента (опционально)</param>
    /// <param name="status">Фильтр по статусу (опционально)</param>
    Task<IEnumerable<MembershipResponseDto>> GetAllAsync(int? clientId = null, string? status = null);

    /// <summary>
    /// Создать новый абонемент.
    /// Автоматически рассчитывает EndDate и TotalVisits.
    /// Автоматически закрывает старый активный абонемент клиента (status → 'completed').
    /// </summary>
    Task<MembershipResponseDto> CreateAsync(CreateMembershipDto dto);

    /// <summary>
    /// Обновить абонемент.
    /// Разрешено менять только Status (для ЧП) и EndDate (для исправлений).
    /// </summary>
    Task<MembershipResponseDto> UpdateAsync(int id, UpdateMembershipDto dto);

    /// <summary>
    /// Удалить абонемент.
    /// Запрещено, если у абонемента есть история посещений.
    /// </summary>
    Task DeleteAsync(int id);

    /// <summary>
    /// Проверить, не истёк ли абонемент по дате, и если да — обновить статус на 'expired'.
    /// Вызывается из VisitService при регистрации посещения.
    /// </summary>
    Task CheckAndUpdateStatusAsync(Membership membership);
}