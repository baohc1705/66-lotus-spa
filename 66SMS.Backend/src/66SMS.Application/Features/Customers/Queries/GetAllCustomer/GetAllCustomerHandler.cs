using _66SMS.Application.DTOs.Customers;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Customers.Queries.GetAllCustomer
{
    public class GetAllCustomerHandler : IRequestHandler<GetAllCustomerQuery, Result<PagedResult<CustomerDTO>>>
    {
        private readonly ICustomerSqlRepository customerSqlRepository;

        public GetAllCustomerHandler(ICustomerSqlRepository customerSqlRepository)
        {
            this.customerSqlRepository = customerSqlRepository;
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
                Items = paged.Items.Select(x => new CustomerDTO
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    FullName = x.FullName,
                    Image = x.Image,
                    Dob = x.Dob.ToDateString(),
                    Gender = x.Gender.ToString(),
                    Phone = x.Phone,
                    Tier = x.Tier,
                    LoyaltyPoint = x.LoyaltyPoint,
                    FirstPurchaseAt = x.FirstPurchaseAt.ToVietnamTimeString(),
                    LastPurchaseAt = x.LastPurchaseAt.ToVietnamTimeString(),
                    Source = x.Source,
                    Status = x.Status.ToString(),
                    Note = x.Note,
                    FullAddreess = x.FullAddreess,
                    Username = x.User != null ? x.User.Username : null,
                    Email = x.User != null ? x.User.Email : null,
                }).ToList(),
                PageIndex = paged.PageIndex,
                PageSize = paged.PageSize,
                TotalCount = paged.TotalCount,
            };
            return Result<PagedResult<CustomerDTO>>.Success(pagedDto); 
        }
    }
}
