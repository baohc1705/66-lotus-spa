using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.ServiceCategories.Commands.CreateServiceCategories
{
    public class CreateServiceCategoriesCommandValidator : AbstractValidator<CreateServiceCategoriesCommand>
    {
        public CreateServiceCategoriesCommandValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(ServiceCategoryConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Description).MaximumLength(ServiceCategoryConst.DESCRIPTION_MAX_LENGTH);
        }
    }
}
