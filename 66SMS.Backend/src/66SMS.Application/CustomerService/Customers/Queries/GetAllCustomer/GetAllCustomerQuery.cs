using _66SMS.Application.DTOs.Customers;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CustomerService.Customers.Queries.GetAllCustomer
{
    public class GetAllCustomerQuery : PageRequest, IRequest<Result<PagedResult<CustomerDTO>>>
    {
    }
}
