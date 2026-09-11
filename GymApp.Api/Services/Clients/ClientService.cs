using GymApp.Api.Data;
using GymApp.Api.DTOs.Clients;
using GymApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GymApp.Api.Services.Clients;

public class ClientService : IClientService
{
    private readonly GymDbContext _context;

    public ClientService(GymDbContext context) => _context = context;

    public async Task<List<ClientResponseDto>> GetAllClientsAsync(string? search = null, string? status = null, bool includeDeleted = false)
    {
        var query = _context.Clients.AsQueryable();

        // 1. Сначала применяем глобальный фильтр удаленных, если не запрошено иное
        if (!includeDeleted)
        {
            query = query.Where(c => !c.IsDeleted);
        }

        // 2. Поиск
        if (!string.IsNullOrWhiteSpace(search))
        {
            var lowerSearch = search.ToLower();
            query = query.Where(c =>
                c.LastName.ToLower().Contains(lowerSearch) ||
                c.Phone.Contains(lowerSearch) ||
                c.FirstName.ToLower().Contains(lowerSearch)
            );
        }

        // 3. Фильтр по статусу (работает и для Active, и для Blacklist, и для Inactive)
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(c => c.Status == status);
        }

        return await query.Select(c => new ClientResponseDto
        {
            Id = c.Id,
            LastName = c.LastName,
            FirstName = c.FirstName,
            Patronymic = c.Patronymic,
            Phone = c.Phone,
            Email = c.Email,
            RegistrationDate = c.RegistrationDate ?? DateTime.Now,
            Status = c.Status,
            IsDeleted = c.IsDeleted
        }).ToListAsync();
    }

    public async Task<ClientResponseDto> GetClientByIdAsync(int id)
    {
        var client = await _context.Clients
            .Where(c => c.Id == id && !c.IsDeleted)
            .Select(c => new ClientResponseDto
            {
                Id = c.Id,
                LastName = c.LastName,
                FirstName = c.FirstName,
                Patronymic = c.Patronymic,
                Phone = c.Phone,
                Email = c.Email,
                RegistrationDate = c.RegistrationDate ?? DateTime.Now,
                Status = c.Status,
                IsDeleted = c.IsDeleted
            })
            .FirstOrDefaultAsync();

        if (client == null)
            throw new KeyNotFoundException($"Клиент с ID {id} не найден");

        return client;
    }

    public async Task<ClientResponseDto> CreateClientAsync(CreateClientDto dto)
    {
        var existingPhone = await _context.Clients.AnyAsync(c => c.Phone == dto.Phone && !c.IsDeleted);
        if (existingPhone)
            throw new InvalidOperationException($"Клиент с телефоном {dto.Phone} уже существует");

        if (!string.IsNullOrEmpty(dto.Email))
        {
            var existingEmail = await _context.Clients.AnyAsync(c => c.Email == dto.Email && !c.IsDeleted);
            if (existingEmail)
                throw new InvalidOperationException($"Клиент с email {dto.Email} уже существует");
        }

        // ✅ ЯВНАЯ ИНИЦИАЛИЗАЦИЯ: Статус всегда Active при создании, независимо от чего-либо
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
            Status = client.Status,
            IsDeleted = client.IsDeleted
        };
    }

    public async Task<ClientResponseDto> UpdateClientAsync(int id, UpdateClientDto dto)
    {
        var client = await _context.Clients.FindAsync(id);

        if (client == null)
            throw new KeyNotFoundException($"Клиент с ID {id} не найден");

        // Проверка уникальности телефона (исключая текущего клиента и удаленных)
        if (client.Phone != dto.Phone)
        {
            var phoneExists = await _context.Clients.AnyAsync(c => c.Phone == dto.Phone && c.Id != id && !c.IsDeleted);
            if (phoneExists)
                throw new InvalidOperationException($"Телефон {dto.Phone} уже используется");
        }

        // Проверка уникальности email
        if (!string.IsNullOrEmpty(dto.Email) && client.Email != dto.Email)
        {
            var emailExists = await _context.Clients.AnyAsync(c => c.Email == dto.Email && c.Id != id && !c.IsDeleted);
            if (emailExists)
                throw new InvalidOperationException($"Email {dto.Email} уже используется");
        }

        // Обновляем базовые поля
        client.LastName = dto.LastName;
        client.FirstName = dto.FirstName;
        client.Patronymic = dto.Patronymic;
        client.Phone = dto.Phone;
        client.Email = dto.Email;

        // ✅ ОБНОВЛЕНИЕ СТАТУСА И ФЛАГА: Только если они переданы во время редактирования
        if (!string.IsNullOrWhiteSpace(dto.Status))
            client.Status = dto.Status;

        if (dto.IsDeleted.HasValue)
            client.IsDeleted = dto.IsDeleted.Value;

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
            Status = client.Status,
            IsDeleted = client.IsDeleted
        };
    }

    public async Task DeleteClientAsync(int id)
    {
        var client = await _context.Clients.FindAsync(id);

        if (client == null || client.IsDeleted)
            throw new KeyNotFoundException($"Клиент с ID {id} не найден");

        client.IsDeleted = true;
        await _context.SaveChangesAsync();
    }
}