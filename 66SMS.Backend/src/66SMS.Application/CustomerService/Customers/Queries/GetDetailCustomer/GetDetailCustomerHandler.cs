using _66SMS.Application.DTOs.Customers;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CustomerService.Customers.Queries.GetDetailCustomer
{
    /// <summary>
    /// Handler for <see cref="GetDetailCustomerQuery"/>
    /// </summary>
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
            var customer = await customerSqlRepository
                .AsQueryable()
                .Where(x => x.Id == request.Id && x.Status != CustomerConst.STATUS_DELETED)
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
                .FirstOrDefaultAsync(cancellationToken);

            if (customer == null)
                return Result<CustomerDTO>.NotFound(CustomerConst.MSG_CUSTOMER_ID_NOT_FOUND, ErrorCodes.ERR_CUSTOMER_NOT_FOUND);
           
            return Result<CustomerDTO>.Success(customer);
        }
    }
}
