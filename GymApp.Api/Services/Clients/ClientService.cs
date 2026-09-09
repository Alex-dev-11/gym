using GymApp.Api.Data;
using GymApp.Api.DTOs.Clients;
using GymApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GymApp.Api.Services.Clients;

public class ClientService : IClientService
{
    private readonly GymDbContext _context;

    public ClientService(GymDbContext context)
    {
        _context = context;
    }

    public async Task<List<ClientResponseDto>> GetAllClientsAsync(string? search = null, string? status = null)
    {
        // 🚀 МАРКЕР: Если ты видишь эту строку в терминале, значит НОВЫЙ код точно работает!
        //Console.WriteLine($"[DEBUG] GetAllClientsAsync вызван с параметрами: search='{search}', status='{status}'");

        var query = _context.Clients
            .Where(c => c.IsDeleted == false)
            .AsQueryable();

        // 1. Поиск (регистронезависимый благодаря .ToLower())
        if (!string.IsNullOrWhiteSpace(search))
        {
            var lowerSearch = search.ToLower();
            query = query.Where(c =>
                c.LastName.ToLower().Contains(lowerSearch) ||   // Приоритет 1: Фамилия
                c.Phone.Contains(lowerSearch) ||                // Приоритет 2: Телефон
                c.FirstName.ToLower().Contains(lowerSearch)     // Приоритет 3: Имя
            );
        }

        // 2. Фильтр по статусу
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(c => c.Status == status);
        }

        // 3. Выполнение запроса и маппинг
        return await query.Select(c => new ClientResponseDto
        {
            Id = c.Id,
            LastName = c.LastName,
            FirstName = c.FirstName,
            Patronymic = c.Patronymic,
            Phone = c.Phone,
            Email = c.Email,
            RegistrationDate = c.RegistrationDate ?? DateTime.Now,
            Status = c.Status
        }).ToListAsync();
    }
    // ✅ ВОЗВРАЩАЕМЫЙ ТИП: Task<ClientResponseDto> (без ?)
    public async Task<ClientResponseDto> GetClientByIdAsync(int id)
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

        // ❌ Было: return client; (мог вернуть null)
        // ✅ Стало: бросаем исключение, middleware вернёт 404
        if (client == null)
        {
            throw new KeyNotFoundException($"Клиент с ID {id} не найден");
        }

        return client;
    }

    public async Task<ClientResponseDto> CreateClientAsync(CreateClientDto dto)
    {
        // 💡 ЗАЩИТНАЯ ПРОВЕРКА: не существует ли клиент с таким телефоном или email?
        // В БД есть UNIQUE constraints, но лучше проверить до попытки вставки,
        // чтобы вернуть понятную ошибку (400), а не ошибку БД (500).
        var existingPhone = await _context.Clients.AnyAsync(c => c.Phone == dto.Phone && !c.IsDeleted);
        if (existingPhone)
        {
            throw new InvalidOperationException($"Клиент с телефоном {dto.Phone} уже существует");
        }

        if (!string.IsNullOrEmpty(dto.Email))
        {
            var existingEmail = await _context.Clients.AnyAsync(c => c.Email == dto.Email && !c.IsDeleted);
            if (existingEmail)
            {
                throw new InvalidOperationException($"Клиент с email {dto.Email} уже существует");
            }
        }

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

    // ✅ ВОЗВРАЩАЕМЫЙ ТИП: Task<ClientResponseDto> (без ?)
    public async Task<ClientResponseDto> UpdateClientAsync(int id, UpdateClientDto dto)
    {
        var client = await _context.Clients.FindAsync(id);

        // ❌ Было: if (client == null || client.IsDeleted == true) return null;
        // ✅ Стало: бросаем исключение
        if (client == null || client.IsDeleted == true)
        {
            throw new KeyNotFoundException($"Клиент с ID {id} не найден");
        }

        // 💡 ПРОВЕРКА УНИКАЛЬНОСТИ: если меняется телефон/email, проверяем, что новый не занят
        if (client.Phone != dto.Phone)
        {
            var phoneExists = await _context.Clients.AnyAsync(c => c.Phone == dto.Phone && c.Id != id && !c.IsDeleted);
            if (phoneExists)
            {
                throw new InvalidOperationException($"Телефон {dto.Phone} уже используется другим клиентом");
            }
        }

        if (!string.IsNullOrEmpty(dto.Email) && client.Email != dto.Email)
        {
            var emailExists = await _context.Clients.AnyAsync(c => c.Email == dto.Email && c.Id != id && !c.IsDeleted);
            if (emailExists)
            {
                throw new InvalidOperationException($"Email {dto.Email} уже используется другим клиентом");
            }
        }

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

    // ✅ ВОЗВРАЩАЕМЫЙ ТИП: Task (без bool)
    public async Task DeleteClientAsync(int id)
    {
        var client = await _context.Clients.FindAsync(id);

        // ❌ Было: if (client == null || client.IsDeleted == true) return false;
        // ✅ Стало: бросаем исключение
        if (client == null || client.IsDeleted == true)
        {
            throw new KeyNotFoundException($"Клиент с ID {id} не найден");
        }

        client.IsDeleted = true;
        await _context.SaveChangesAsync();
    }
}