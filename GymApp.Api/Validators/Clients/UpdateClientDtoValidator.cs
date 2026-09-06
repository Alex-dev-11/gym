using FluentValidation;
using GymApp.Api.DTOs.Clients;

namespace GymApp.Api.Validators;

public class UpdateClientDtoValidator : AbstractValidator<UpdateClientDto>
{
    public UpdateClientDtoValidator()
    {
        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Фамилия обязательна")
            .MaximumLength(100).WithMessage("Максимум 100 символов");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Имя обязательно")
            .MaximumLength(100).WithMessage("Максимум 100 символов");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Телефон обязателен")
            .Matches(@"^\+?[0-9]{10,20}$").WithMessage("Неверный формат телефона");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Неверный формат email")
            .When(x => !string.IsNullOrEmpty(x.Email));
    }
}