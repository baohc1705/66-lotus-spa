using _66SMS.Application.DTOs.Customers;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.CustomerService.Customers.Queries.GetAllCustomer
{
    /// <summary>
    /// Handler for <see cref="GetAllCustomerQuery"/>
    /// </summary>
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
            // filter
            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.FullName.StartsWith(request.Filter) || x.Phone == request.Filter || x.User!.Email == request.Filter);
            }

            if (request.Status != null)
            {
                query = query.Where(x => x.Status == request.Status);
            }

            // order
            query = request.OrderBy?.ToLower() switch
            {
                "email" => request.IsDescending ? query.OrderByDescending(x => x.User!.Email) : query.OrderBy(x => x.User!.Email),
                "fullname" => request.IsDescending ? query.OrderByDescending(x => x.FullName) : query.OrderBy(x => x.FullName),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            var customers = await query
                .Select(x => new CustomerDTO
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    FullName = x.FullName,
                    AvatarUrl = x.AvatarUrl,
                    DateOfBirth = x.DateOfBirth.ToString(),
                    Gender = x.Gender,
                    Phone = x.Phone,
                    LoyaltyPoint = x.LoyaltyPoint,
                    FirstPurchaseAt = x.FirstPurchaseAt.ToString(),
                    LastPurchaseAt = x.LastPurchaseAt.ToString(),
                    Source = x.Source,
                    Status = x.Status,
                    Note = x.Note,
                    FullAddress = x.FullAddress,
                    StreetAddress = x.StreetAddress,
                    ProvinceCode = x.ProvinceCode,
                    WardCode = x.WardCode,
                    Email = x.User.Email
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<CustomerDTO>>.Success(customers);
        }
    }
}
