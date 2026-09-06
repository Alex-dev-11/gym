using GymApp.Api.Data;
using GymApp.Api.DTOs;
using GymApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GymApp.Api.Services;

public class ClientService : IClientService
{
    private readonly GymDbContext _context;

    public ClientService(GymDbContext context)
    {
        _context = context;
    }

    public async Task<List<ClientResponseDto>> GetAllClientsAsync()
    {
        return await _context.Clients
            .Where(c => c.IsDeleted == false)
            .Select(c => new ClientResponseDto
            {
                Id = c.Id,
                LastName = c.LastName,
                FirstName = c.FirstName,
                Patronymic = c.Patronymic,
                Phone = c.Phone,
                Email = c.Email,
                RegistrationDate = c.RegistrationDate ?? DateTime.Now,
                Status = c.Status
            })
            .ToListAsync();
    }

    public async Task<ClientResponseDto?> GetClientByIdAsync(int id)
    {
        var client = await _context.Clients
            .Where(c => c.Id == id && c.IsDeleted == false)
            .Select(c => new ClientResponseDto
            {
                Id = c.Id,
                LastName = c.LastName,
                FirstName = c.FirstName,
                Patronymic = c.Patronymic,
                Phone = c.Phone,
                Email = c.Email,
                RegistrationDate = c.RegistrationDate ?? DateTime.Now,
                Status = c.Status
            })
            .FirstOrDefaultAsync();

        return client;
    }

    public async Task<ClientResponseDto> CreateClientAsync(CreateClientDto dto)
    {
        var client = new Client
        {
            LastName = dto.LastName,
            FirstName = dto.FirstName,
            Patronymic = dto.Patronymic,
            Phone = dto.Phone,
            Email = dto.Email,
            RegistrationDate = DateTime.Now,
            Status = "active",
            IsDeleted = false
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync();

        return new ClientResponseDto
        {
            Id = client.Id,
            LastName = client.LastName,
            FirstName = client.FirstName,
            Patronymic = client.Patronymic,
            Phone = client.Phone,
            Email = client.Email,
            RegistrationDate = client.RegistrationDate ?? DateTime.Now,
            Status = client.Status
        };
    }

    public async Task<ClientResponseDto?> UpdateClientAsync(int id, UpdateClientDto dto)
    {
        var client = await _context.Clients.FindAsync(id);

        if (client == null || client.IsDeleted == true)
            return null;

        client.LastName = dto.LastName;
        client.FirstName = dto.FirstName;
        client.Patronymic = dto.Patronymic;
        client.Phone = dto.Phone;
        client.Email = dto.Email;

        await _context.SaveChangesAsync();

        return new ClientResponseDto
        {
            Id = client.Id,
            LastName = client.LastName,
            FirstName = client.FirstName,
            Patronymic = client.Patronymic,
            Phone = client.Phone,
            Email = client.Email,
            RegistrationDate = client.RegistrationDate ?? DateTime.Now,
            Status = client.Status
        };
    }

    public async Task<bool> DeleteClientAsync(int id)
    {
        var client = await _context.Clients.FindAsync(id);

        if (client == null || client.IsDeleted == true)
            return false;

        client.IsDeleted = true;
        await _context.SaveChangesAsync();

        return true;
    }
}