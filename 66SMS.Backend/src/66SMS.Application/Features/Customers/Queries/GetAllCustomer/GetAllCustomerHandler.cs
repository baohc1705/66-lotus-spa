using _66SMS.Application.DTOs.Customers;
using _66SMS.Contracts.Extensions;
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
            var query = customerSqlRepository.AsQueryable();

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.FullName.StartsWith(request.Filter) || x.Phone == request.Filter || x.User!.Email == request.Filter);
            }

            query = request.OrderBy?.ToLower() switch
            {
                "email" => request.IsDescending ? query.OrderByDescending(x => x.User!.Email) : query.OrderBy(x => x.User!.Email),
                "fullname" => request.IsDescending ? query.OrderByDescending(x => x.FullName) : query.OrderBy(x => x.FullName),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            query = query.Include(x => x.User);

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
