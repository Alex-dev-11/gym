using FluentValidation;
using GymApp.Api.DTOs.Employees;

namespace GymApp.Api.Validators.Employees;

public class CreateEmployeeDtoValidator : AbstractValidator<CreateEmployeeDto>
{
    public CreateEmployeeDtoValidator()
    {
        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Фамилия обязательна")
            .MaximumLength(100).WithMessage("Максимум 100 символов");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Имя обязательно")
            .MaximumLength(100).WithMessage("Максимум 100 символов");

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage("Максимум 20 символов");

        RuleFor(x => x.Position)
            .Must(p => p == "trainer" || p == "administrator")
            .WithMessage("Должность должна быть 'trainer' или 'administrator'");
    }
}