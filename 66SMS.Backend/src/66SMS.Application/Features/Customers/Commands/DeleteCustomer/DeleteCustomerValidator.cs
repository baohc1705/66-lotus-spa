using FluentValidation;

namespace _66SMS.Application.Features.Customers.Commands.DeleteCustomer
{
    public class DeleteCustomerValidator : AbstractValidator<DeleteCustomerCommand>
    {
        public DeleteCustomerValidator() 
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
