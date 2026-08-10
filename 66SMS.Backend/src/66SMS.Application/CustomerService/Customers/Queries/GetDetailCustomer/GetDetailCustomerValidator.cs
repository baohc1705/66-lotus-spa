using FluentValidation;

namespace _66SMS.Application.CustomerService.Customers.Queries.GetDetailCustomer
{
    /// <summary>
    /// Validator for <see cref="GetDetailCustomerQuery"/>
    /// </summary>
    public class GetDetailCustomerValidator : AbstractValidator<GetDetailCustomerQuery>
    {
        public GetDetailCustomerValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
