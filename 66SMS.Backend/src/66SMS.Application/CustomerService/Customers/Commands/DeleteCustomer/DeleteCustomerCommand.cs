using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CustomerService.Customers.Commands.DeleteCustomer
{
    public class DeleteCustomerCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
