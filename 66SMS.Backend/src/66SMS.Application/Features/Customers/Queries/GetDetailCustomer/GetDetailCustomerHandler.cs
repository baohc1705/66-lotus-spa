using _66SMS.Application.DTOs.Customers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Customers.Queries.GetDetailCustomer
{
    public class GetDetailCustomerHandler : IRequestHandler<GetDetailCustomerQuery, Result<CustomerDTO>>
    {
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IMapper mapper;

        public GetDetailCustomerHandler(ICustomerSqlRepository customerSqlRepository, IMapper mapper)
        {
            this.customerSqlRepository = customerSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<CustomerDTO>> Handle(GetDetailCustomerQuery request, CancellationToken cancellationToken)
        {
            Customer? customer = await customerSqlRepository.Query()
                .Where(x => x.Id == request.Id)
                .Include(x => x.Include(x => x.User))
                .FirstOrDefaultAsync(cancellationToken);

            if (customer == null) return Result<CustomerDTO>.NotFound();

            CustomerDTO customerDTO = mapper.Map<CustomerDTO>(customer);
            customerDTO.Username = customer.User != null ? customer.User.Username : null;
            customerDTO.Email = customer.User != null ? customer.User.Email : null;

            return Result<CustomerDTO>.Success(customerDTO);
        }
    }
}
