using GymApp.Api.DTOs.Visits;

namespace GymApp.Api.Services.Visits;

/// <summary>
/// Интерфейс сервиса для работы с посещениями.
/// Содержит всю бизнес-логику: проверка статуса абонемента, списание посещений,
/// автоматическое закрытие абонемента при достижении лимита.
/// 
/// ═══════════════════════════════════════════════════════════════
/// ВАЖНО: ПОСЕЩЕНИЯ — ЭТО ИСТОРИЧЕСКИЕ ДАННЫЕ!
/// ═══════════════════════════════════════════════════════════════
/// 
/// Посещения нельзя редактировать или удалять.
/// В БД есть триггер, который защищает поля membership_id и visit_time от изменений.
/// Поэтому в интерфейсе есть только методы создания и чтения.
/// </summary>
public interface IVisitService
{
    /// <summary>
    /// Получить посещение по ID.
    /// </summary>
    Task<VisitResponseDto> GetByIdAsync(int id);

    /// <summary>
    /// Получить все посещения с опциональной фильтрацией.
    /// </summary>
    /// <param name="membershipId">Фильтр по ID абонемента (опционально)</param>
    Task<IEnumerable<VisitResponseDto>> GetAllAsync(int? membershipId = null);

    /// <summary>
    /// Зарегистрировать новое посещение.
    /// 
    /// Бизнес-логика:
    /// 1. Проверяет существование абонемента
    /// 2. Вызывает CheckAndUpdateStatusAsync (автообновление статуса на 'expired', если дата прошла)
    /// 3. Проверяет статус абонемента (должен быть 'active')
    /// 4. Проверяет лимит посещений (для single: used_visits < total_visits)
    /// 5. Создаёт запись в visits
    /// 6. Увеличивает used_visits
    /// 7. Если used_visits == total_visits → статус абонемента = 'completed'
    /// </summary>
    Task<VisitResponseDto> CreateAsync(CreateVisitDto dto);
}