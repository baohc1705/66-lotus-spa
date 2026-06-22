using FluentValidation;

namespace _66SMS.Application.CatalogService.ServiceProducts.Commands.UpdateServiceProducts
{
    public class UpdateServiceProductValidator : AbstractValidator<UpdateServiceProductCommand>
    {
        public UpdateServiceProductValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("Id không hợp lệ.");
        }
    }
}
