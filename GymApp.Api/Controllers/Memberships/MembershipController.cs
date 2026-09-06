using GymApp.Api.DTOs.Memberships;
using GymApp.Api.Services.Memberships;
using Microsoft.AspNetCore.Mvc;

namespace GymApp.Api.Controllers.Memberships;

/// <summary>
/// Контроллер для работы с абонементами.
/// 
/// ═══════════════════════════════════════════════════════════════
/// ОТВЕТСТВЕННОСТЬ КОНТРОЛЛЕРА:
/// ═══════════════════════════════════════════════════════════════
/// 
/// ✅ Принимает HTTP-запросы
/// ✅ Извлекает параметры (из URL и тела запроса)
/// ✅ Вызывает методы сервиса
/// ✅ Возвращает HTTP-ответы с правильными статусами
/// ✅ Обрабатывает исключения (превращает в HTTP-ошибки)
/// 
/// ❌ НЕ содержит бизнес-логики (это задача MembershipService)
/// ❌ НЕ работает напрямую с БД
/// ❌ НЕ валидирует данные (это задача FluentValidation)
/// 
/// ═══════════════════════════════════════════════════════════════
/// ENDPOINTS:
/// ═══════════════════════════════════════════════════════════════
/// 
/// GET    /api/memberships              → Список абонементов (с фильтрацией)
/// GET    /api/memberships/{id}         → Один абонемент по ID
/// POST   /api/memberships              → Создать новый абонемент
/// PUT    /api/memberships/{id}         → Обновить абонемент
/// DELETE /api/memberships/{id}         → Удалить абонемент
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MembershipsController : ControllerBase
{
    private readonly IMembershipService _membershipService;

    /// <summary>
    /// Конструктор. Зависимости внедряются через DI.
    /// 
    /// Когда ASP.NET Core создаёт контроллер для обработки запроса,
    /// он автоматически находит зарегистрированный IMembershipService
    /// (через AddScoped в Program.cs) и передаёт его в конструктор.
    /// </summary>
    public MembershipsController(IMembershipService membershipService)
    {
        _membershipService = membershipService;
    }

    /// <summary>
    /// GET /api/memberships
    /// Получить список абонементов с опциональной фильтрацией.
    /// 
    /// Query-параметры:
    /// - clientId (int?) — фильтр по ID клиента
    /// - status (string?) — фильтр по статусу
    /// 
    /// Примеры:
    /// - GET /api/memberships → все абонементы
    /// - GET /api/memberships?clientId=5 → абонементы клиента №5
    /// - GET /api/memberships?status=active → только активные
    /// - GET /api/memberships?clientId=5&status=active → активные клиента №5
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MembershipResponseDto>>> GetAll(
        [FromQuery] int? clientId = null,
        [FromQuery] string? status = null)
    {
        var memberships = await _membershipService.GetAllAsync(clientId, status);
        return Ok(memberships); // HTTP 200 + JSON
    }

    /// <summary>
    /// GET /api/memberships/{id}
    /// Получить один абонемент по ID.
    /// 
    /// Если абонемент не найден → HTTP 404 Not Found.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<MembershipResponseDto>> GetById(int id)
    {
        try
        {
            var membership = await _membershipService.GetByIdAsync(id);
            return Ok(membership); // HTTP 200 + JSON
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message }); // HTTP 404
        }
    }

    /// <summary>
    /// POST /api/memberships
    /// Создать новый абонемент.
    /// 
    /// Тело запроса (JSON):
    /// {
    ///   "clientId": 5,
    ///   "type": "month",
    ///   "startDate": "2026-09-06"
    /// }
    /// 
    /// Если клиент не найден → HTTP 404 Not Found.
    /// Если данные невалидны → HTTP 400 Bad Request (обработает FluentValidation).
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<MembershipResponseDto>> Create([FromBody] CreateMembershipDto dto)
    {
        try
        {
            var membership = await _membershipService.CreateAsync(dto);

            // HTTP 201 Created + JSON + ссылка на созданный ресурс
            return CreatedAtAction(
                actionName: nameof(GetById),
                routeValues: new { id = membership.Id },
                value: membership
            );
        }
        catch (KeyNotFoundException ex)
        {
            // Клиент не найден
            return NotFound(new { message = ex.Message }); // HTTP 404
        }
        catch (InvalidOperationException ex)
        {
            // Бизнес-ошибка (например, неизвестный тип абонемента)
            return BadRequest(new { message = ex.Message }); // HTTP 400
        }
    }

    /// <summary>
    /// PUT /api/memberships/{id}
    /// Обновить абонемент.
    /// 
    /// Тело запроса (JSON):
    /// {
    ///   "status": "cancelled",
    ///   "endDate": "2026-10-06"
    /// }
    /// 
    /// Если абонемент не найден → HTTP 404 Not Found.
    /// Если данные невалидны → HTTP 400 Bad Request.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<MembershipResponseDto>> Update(int id, [FromBody] UpdateMembershipDto dto)
    {
        try
        {
            var membership = await _membershipService.UpdateAsync(id, dto);
            return Ok(membership); // HTTP 200 + JSON
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message }); // HTTP 404
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message }); // HTTP 400
        }
    }

    /// <summary>
    /// DELETE /api/memberships/{id}
    /// Удалить абонемент.
    /// 
    /// Если абонемент не найден → HTTP 404 Not Found.
    /// Если у абонемента есть посещения → HTTP 400 Bad Request.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            await _membershipService.DeleteAsync(id);
            return NoContent(); // HTTP 204 (успех, но нет тела ответа)
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message }); // HTTP 404
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message }); // HTTP 400
        }
    }
}