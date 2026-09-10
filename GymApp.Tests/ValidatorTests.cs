using Xunit;
using FluentValidation.TestHelper;
using GymApp.Api.DTOs.Clients;
using GymApp.Api.Validators;

namespace GymApp.Tests;

public class ClientValidatorTests
{
    [Fact]
    public void CreateClient_WithEmptyPhone_ShouldFail()
    {
        // 1. Создаем валидатор
        var validator = new CreateClientDtoValidator();

        // 2. Создаем DTO с ошибкой (пустой телефон)
        var dto = new CreateClientDto
        {
            FirstName = "Иван",
            LastName = "Иванов",
            Phone = "" // <-- Специально ошибка
        };

        // 3. Проверяем
        var result = validator.TestValidate(dto);

        // 4. Ожидаем ошибку для поля Phone
        result.ShouldHaveValidationErrorFor(x => x.Phone);
    }

    [Fact]
    public void CreateClient_WithValidData_ShouldPass()
    {
        // 1. Создаем валидатор
        var validator = new CreateClientDtoValidator();

        // 2. Создаем DTO с валидными данными
        var dto = new CreateClientDto
        {
            FirstName = "Петр",
            LastName = "Петров",
            Phone = "89001112233"
        };

        // 3. Проверяем
        var result = validator.TestValidate(dto);

        // 4. Ожидаем, что ошибок НЕТ
        result.ShouldNotHaveAnyValidationErrors();
    }
}

/* GymApp.Tests (тест) net10.0 успешно выполнено (0,8 с)

Сводка теста: всего: 2; сбой: 0; успешно: 2; пропущено: 0; длительность: 0,8 с*/