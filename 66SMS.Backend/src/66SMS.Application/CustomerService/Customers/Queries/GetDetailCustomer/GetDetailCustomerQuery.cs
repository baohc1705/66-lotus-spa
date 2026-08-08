using _66SMS.Application.DTOs.Customers;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CustomerService.Customers.Queries.GetDetailCustomer
{
    /// <summary>
    /// Get detail customer by id request
    /// </summary>
    public record GetDetailCustomerQuery : IRequest<Result<CustomerDTO>>
    {
        public int? Id { get; set; }
    }
}
