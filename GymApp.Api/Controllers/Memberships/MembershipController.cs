using GymApp.Api.DTOs.Memberships;
using GymApp.Api.Services.Memberships;
using Microsoft.AspNetCore.Mvc;

namespace GymApp.Api.Controllers.Memberships;

/// <summary>
/// Контроллер для работы с абонементами.
/// 
/// ВАЖНО: Обработка исключений вынесена в ExceptionHandlingMiddleware.
/// Контроллер содержит только HTTP-логику.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MembershipsController : ControllerBase
{
    private readonly IMembershipService _membershipService;

    public MembershipsController(IMembershipService membershipService)
    {
        _membershipService = membershipService;
    }

    /// <summary>
    /// GET /api/memberships
    /// Получить список абонементов с опциональной фильтрацией.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MembershipResponseDto>>> GetAll(
        [FromQuery] int? clientId = null,
        [FromQuery] string? status = null)
    {
        var memberships = await _membershipService.GetAllAsync(clientId, status);
        return Ok(memberships); // HTTP 200
    }

    /// <summary>
    /// GET /api/memberships/{id}
    /// Получить один абонемент по ID.
    /// Если не найден → middleware вернёт HTTP 404.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<MembershipResponseDto>> GetById(int id)
    {
        var membership = await _membershipService.GetByIdAsync(id);
        return Ok(membership); // HTTP 200
    }

    /// <summary>
    /// POST /api/memberships
    /// Создать новый абонемент.
    /// Если клиент не найден → middleware вернёт HTTP 404.
    /// Если бизнес-ошибка → middleware вернёт HTTP 400.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<MembershipResponseDto>> Create([FromBody] CreateMembershipDto dto)
    {
        var membership = await _membershipService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = membership.Id },
            membership
        ); // HTTP 201
    }

    /// <summary>
    /// PUT /api/memberships/{id}
    /// Обновить абонемент (только статус или дата окончания).
    /// Если не найден → middleware вернёт HTTP 404.
    /// Если бизнес-ошибка → middleware вернёт HTTP 400.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<MembershipResponseDto>> Update(int id, [FromBody] UpdateMembershipDto dto)
    {
        var membership = await _membershipService.UpdateAsync(id, dto);
        return Ok(membership); // HTTP 200
    }

    /// <summary>
    /// DELETE /api/memberships/{id}
    /// Удалить абонемент.
    /// Если не найден → middleware вернёт HTTP 404.
    /// Если есть посещения → middleware вернёт HTTP 400.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _membershipService.DeleteAsync(id);
        return NoContent(); // HTTP 204
    }
}