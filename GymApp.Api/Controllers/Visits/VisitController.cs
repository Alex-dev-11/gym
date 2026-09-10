using GymApp.Api.DTOs.Visits;
using GymApp.Api.Services.Visits;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace GymApp.Api.Controllers;

/// <summary>
/// Контроллер для работы с посещениями.
/// 
/// ВАЖНО: Обработка исключений вынесена в ExceptionHandlingMiddleware.
/// Посещения являются историческими данными: методы Update и Delete отсутствуют.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VisitsController : ControllerBase
{
    private readonly IVisitService _visitService;

    public VisitsController(IVisitService visitService)
    {
        _visitService = visitService;
    }

    /// <summary>
    /// GET /api/visits
    /// Получить список всех посещений.
    /// Можно отфильтровать по ID абонемента: GET /api/visits?membershipId=5
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VisitResponseDto>>> GetAll(
        [FromQuery] int? membershipId = null)
    {
        var visits = await _visitService.GetAllAsync(membershipId);
        return Ok(visits); // HTTP 200
    }

    /// <summary>
    /// GET /api/visits/{id}
    /// Получить конкретное посещение по ID.
    /// Если не найдено → middleware вернёт HTTP 404.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<VisitResponseDto>> GetById(int id)
    {
        var visit = await _visitService.GetByIdAsync(id);
        return Ok(visit); // HTTP 200
    }

    /// <summary>
    /// POST /api/visits
    /// Зарегистрировать новое посещение.
    /// 
    /// Тело запроса (JSON):
    /// {
    ///   "membershipId": 10,
    ///   "trainerId": 3,        // опционально
    ///   "processedByUserId": 1 // опционально
    /// }
    /// 
    /// Если абонемент не найден → middleware вернёт HTTP 404.
    /// Если абонемент неактивен/истёк/лимит исчерпан → middleware вернёт HTTP 400.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<VisitResponseDto>> Create([FromBody] CreateVisitDto dto)
    {
        var visit = await _visitService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = visit.Id },
            visit
        ); // HTTP 201
    }
}