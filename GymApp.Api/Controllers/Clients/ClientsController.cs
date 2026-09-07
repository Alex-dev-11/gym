using GymApp.Api.DTOs.Clients;
using GymApp.Api.Services.Clients;
using Microsoft.AspNetCore.Mvc;

namespace GymApp.Api.Controllers.Clients;

/// <summary>
/// Контроллер для работы с клиентами.
/// 
/// ВАЖНО: Обработка исключений (404, 400, 500) вынесена в ExceptionHandlingMiddleware.
/// Контроллер содержит только HTTP-логику: приём запросов, вызов сервисов, возврат успешных ответов.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(IClientService clientService)
    {
        _clientService = clientService;
    }

    /// <summary>
    /// GET /api/clients
    /// Получить список всех клиентов.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ClientResponseDto>>> GetAll()
    {
        var clients = await _clientService.GetAllClientsAsync();
        return Ok(clients); // HTTP 200
    }

    /// <summary>
    /// GET /api/clients/{id}
    /// Получить клиента по ID.
    /// Если не найден → middleware вернёт HTTP 404 (KeyNotFoundException).
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ClientResponseDto>> GetById(int id)
    {
        var client = await _clientService.GetClientByIdAsync(id);
        return Ok(client); // HTTP 200
    }

    /// <summary>
    /// POST /api/clients
    /// Создать нового клиента.
    /// Если данные невалидны → FluentValidation вернёт HTTP 400.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ClientResponseDto>> Create([FromBody] CreateClientDto dto)
    {
        var created = await _clientService.CreateClientAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = created.Id },
            created
        ); // HTTP 201
    }

    /// <summary>
    /// PUT /api/clients/{id}
    /// Обновить клиента.
    /// Если не найден → middleware вернёт HTTP 404.
    /// Если бизнес-ошибка → middleware вернёт HTTP 400.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ClientResponseDto>> Update(int id, [FromBody] UpdateClientDto dto)
    {
        var updated = await _clientService.UpdateClientAsync(id, dto);
        return Ok(updated); // HTTP 200
    }

    /// <summary>
    /// DELETE /api/clients/{id}
    /// Мягко удалить клиента (is_deleted = true).
    /// Если не найден → middleware вернёт HTTP 404.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _clientService.DeleteClientAsync(id);
        return NoContent(); // HTTP 204
    }
}