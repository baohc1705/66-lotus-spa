using FluentValidation;

namespace _66SMS.Application.CustomerService.Customers.Commands.DeleteCustomer
{
    /// <summary>
    /// Validator for <see cref="DeleteCustomerCommand"/>
    /// </summary>
    public class DeleteCustomerValidator : AbstractValidator<DeleteCustomerCommand>
    {
        public DeleteCustomerValidator() 
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
