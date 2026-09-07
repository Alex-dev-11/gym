namespace GymApp.Api.DTOs.Visits;

/// <summary>
/// DTO для ответа API при получении списка посещений.
/// 
/// ═══════════════════════════════════════════════════════════════
/// БИЗНЕС-ЛОГИКА:
/// ═══════════════════════════════════════════════════════════════
/// 
/// Посещения — это исторические данные. Их нельзя редактировать или удалять.
/// В БД есть триггер, который защищает поля membership_id и visit_time от изменений.
/// 
/// ═══════════════════════════════════════════════════════════════
/// ОПТИМИЗАЦИЯ (избегаем N+1 запросов):
/// ═══════════════════════════════════════════════════════════════
/// 
/// Поля ClientFullName и MembershipType заполняются через JOIN с таблицами
/// clients и memberships прямо в SQL-запросе (через EF Core .Select()).
/// Это позволяет получить данные без дополнительных запросов к БД.
/// </summary>
public class VisitResponseDto
{
    /// <summary>
    /// ID посещения.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// ID абонемента, по которому зарегистрировано посещение.
    /// </summary>
    public int MembershipId { get; set; }

    /// <summary>
    /// Полное имя клиента (Фамилия Имя Отчество).
    /// Заполняется через JOIN с таблицей clients.
    /// </summary>
    public string ClientFullName { get; set; } = string.Empty;

    /// <summary>
    /// Тип абонемента ('single', 'month', 'year').
    /// Заполняется через JOIN с таблицей memberships.
    /// </summary>
    public string MembershipType { get; set; } = string.Empty;

    /// <summary>
    /// ID тренера (опционально).
    /// </summary>
    public int? TrainerId { get; set; }

    /// <summary>
    /// Имя тренера (опционально).
    /// Заполняется через JOIN с таблицей employees.
    /// </summary>
    public string? TrainerName { get; set; }

    /// <summary>
    /// ID оператора, зарегистрировавшего посещение (опционально).
    /// </summary>
    public int? ProcessedByUserId { get; set; }

    /// <summary>
    /// Дата и время посещения.
    /// Устанавливается автоматически при создании (DateTime.Now).
    /// </summary>
    public DateTime VisitTime { get; set; }
}