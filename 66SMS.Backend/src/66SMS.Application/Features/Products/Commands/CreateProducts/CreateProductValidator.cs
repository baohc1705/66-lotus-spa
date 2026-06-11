using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.Products.Commands.CreateProducts
{
    public class CreateProductValidator : AbstractValidator<CreateProductCommand>
    {
        public CreateProductValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(ProductConst.CODE_MAX_LENGTH);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(ProductConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Description).MaximumLength(ProductConst.DESCRIPTION_MAX_LENGTH);
            RuleFor(x => x.Unit).NotEmpty().MaximumLength(ProductConst.UNIT_MAX_LENGTH);
        }
    }
}
