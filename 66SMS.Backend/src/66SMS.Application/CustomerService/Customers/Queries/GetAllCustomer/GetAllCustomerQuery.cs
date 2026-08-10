using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CustomerService.Customers.Queries.GetAllCustomer
{
    /// <summary>
    /// Get all customer request
    /// </summary>
    public class GetAllCustomerQuery : PageRequest, IRequest<Result<PagedResult<CustomerDTO>>>
    {
        public int? Status {  get; set; }
        public int? Gender { get; set; }
        public string? Source { get; set; }
    }
}
