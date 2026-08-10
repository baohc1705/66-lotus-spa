using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CustomerService.Customers.Commands.DeleteCustomer
{
    /// <summary>
    /// Delete customer request
    /// </summary>
    public class DeleteCustomerCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
