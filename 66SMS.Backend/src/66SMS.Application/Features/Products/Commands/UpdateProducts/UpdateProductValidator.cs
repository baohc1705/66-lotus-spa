using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.Products.Commands.UpdateProducts
{
    public class UpdateProductValidator : AbstractValidator<UpdateProductCommand>
    {
        public UpdateProductValidator()
        {
            RuleFor(x => x.Code).MaximumLength(ProductConst.CODE_MAX_LENGTH);
            RuleFor(x => x.Name).MaximumLength(ProductConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Description).MaximumLength(ProductConst.DESCRIPTION_MAX_LENGTH);
            RuleFor(x => x.Unit).MaximumLength(ProductConst.UNIT_MAX_LENGTH);
        }
    }
}
