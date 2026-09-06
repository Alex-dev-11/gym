using GymApp.Api.DTOs;
using GymApp.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GymApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(IClientService clientService)
    {
        _clientService = clientService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ClientResponseDto>>> GetAll()
    {
        var clients = await _clientService.GetAllClientsAsync();
        return Ok(clients);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClientResponseDto>> GetById(int id)
    {
        var client = await _clientService.GetClientByIdAsync(id);

        if (client == null)
            return NotFound();

        return Ok(client);
    }

    [HttpPost]
    public async Task<ActionResult<ClientResponseDto>> Create([FromBody] CreateClientDto dto)
    {
        var created = await _clientService.CreateClientAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ClientResponseDto>> Update(int id, [FromBody] UpdateClientDto dto)
    {
        var updated = await _clientService.UpdateClientAsync(id, dto);

        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var success = await _clientService.DeleteClientAsync(id);

        if (!success)
            return NotFound();

        return NoContent();
    }
}