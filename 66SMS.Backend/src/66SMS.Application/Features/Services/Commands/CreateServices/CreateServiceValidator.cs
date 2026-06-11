using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.Services.Commands.CreateServices
{
    public class CreateServiceValidator : AbstractValidator<CreateServiceCommand>
    {
        public CreateServiceValidator()
        {
            RuleFor(x => x.CategoryId).NotEmpty();
            RuleFor(x => x.Code).NotEmpty().MaximumLength(ServiceConst.CODE_MAX_LENGTH);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(ServiceConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Description).MaximumLength(ServiceConst.DESCRIPTION_MAX_LENGTH);
        }
    }
}
