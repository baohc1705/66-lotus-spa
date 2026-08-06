using FluentValidation;

namespace _66SMS.Application.CatalogService.ServiceProducts.Commands.CreateServiceProducts
{
    public class CreateServiceProductValidator : AbstractValidator<CreateServiceProductCommand>
    {
        public CreateServiceProductValidator()
        {
            RuleFor(x => x.ServiceId).GreaterThan(0).WithMessage("ServiceId không hợp lệ.");
            RuleFor(x => x.ProductId).GreaterThan(0).WithMessage("ProductId không hợp lệ.");
            RuleFor(x => x.QuantityUsed).GreaterThan(0).WithMessage("QuantityUsed phải lớn hơn 0.");
            RuleFor(x => x.UnitCost).GreaterThanOrEqualTo(0).When(x => x.UnitCost != null);
        }
    }
}
