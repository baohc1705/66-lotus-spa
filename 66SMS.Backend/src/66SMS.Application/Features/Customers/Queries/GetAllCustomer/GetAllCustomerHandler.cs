using _66SMS.Application.DTOs.Customers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Customers.Queries.GetAllCustomer
{
    public class GetAllCustomerHandler : IRequestHandler<GetAllCustomerQuery, Result<PagedResult<CustomerDTO>>>
    {
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IMapper mapper;

        public GetAllCustomerHandler(ICustomerSqlRepository customerSqlRepository, IMapper mapper)
        {
            this.customerSqlRepository = customerSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<CustomerDTO>>> Handle(GetAllCustomerQuery request, CancellationToken cancellationToken)
        {
            var query = customerSqlRepository.Query();

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.FullName.StartsWith(request.Filter) || x.Phone == request.Filter || x.User.Email == request.Filter);
            }

            query = request.OrderBy?.ToLower() switch
            {
                "email" => query.OrderBy(x => x.User.Email, request.IsDescending),
                "fullname" => query.OrderBy(x => x.FullName, request.IsDescending),
                _ => query.OrderBy(x => x.CreatedAt, request.IsDescending)
            };

            query = query.Include(x => x.Include(x => x.User));

            PagedResult<Customer> paged = await query.ToPagedAsync(request, cancellationToken);

            PagedResult<CustomerDTO> pagedDto = new()
            {
                Items = mapper.Map<List<CustomerDTO>>(paged.Items),
                PageIndex = paged.PageIndex,
                PageSize = paged.PageSize,
                TotalCount = paged.TotalCount,
            };
            return Result<PagedResult<CustomerDTO>>.Success(pagedDto); 
        }
    }
}
