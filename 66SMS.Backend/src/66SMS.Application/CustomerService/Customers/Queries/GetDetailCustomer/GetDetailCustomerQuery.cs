using _66SMS.Application.DTOs.Customers;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CustomerService.Customers.Queries.GetDetailCustomer
{
    public record GetDetailCustomerQuery : IRequest<Result<CustomerDTO>>
    {
        public int? Id { get; set; }
    }
}
