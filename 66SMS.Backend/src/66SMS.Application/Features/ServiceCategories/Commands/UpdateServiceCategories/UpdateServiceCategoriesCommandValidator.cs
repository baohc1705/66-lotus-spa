using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.ServiceCategories.Commands.UpdateServiceCategories
{
    public class UpdateServiceCategoriesCommandValidator : AbstractValidator<UpdateServiceCategoriesCommand>
    {
        public UpdateServiceCategoriesCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Name).MaximumLength(ServiceCategoryConst.NAME_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Name));
            RuleFor(x => x.Description).MaximumLength(ServiceCategoryConst.DESCRIPTION_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Description));
        }
    }
}
