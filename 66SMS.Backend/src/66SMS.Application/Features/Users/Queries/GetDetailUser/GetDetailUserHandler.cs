using _66SMS.Application.DTOs.Users;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Users.Queries.GetDetailUser
{
    public class GetDetailUserHandler : IRequestHandler<GetDetailUserQuery, Result<UserDto>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ICustomerSqlRepository customerSqlRepository;

        public GetDetailUserHandler(
            IUserSqlRepository userSqlRepository,
            IUserRoleSqlRepository userRoleSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ICustomerSqlRepository customerSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
            this.userRoleSqlRepository = userRoleSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.customerSqlRepository = customerSqlRepository;
        }

        public async Task<Result<UserDto>> Handle(GetDetailUserQuery request, CancellationToken cancellationToken)
        {
            User? user = await userSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null)
                return Result<UserDto>.NotFound(UserConst.MSG_USER_NOT_FOUND, ErrorCodes.ERR_USER_NOT_FOUND);

            Role? role = await userRoleSqlRepository.GetRoleByUserIdAsync(user.Id, cancellationToken);
            List<string>? permissions = role == null ? [] : await userRoleSqlRepository.GetPermissionKeysByUserIdAndRoleIdAsync(user.Id, role.Id, cancellationToken);

            UserDto userDto = new()
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                IsEmailConfirmed = user.IsEmailConfirmed,
                Status = user.Status.ToString(),
                LockoutEnd = user.LockoutEnd.ToVietnamTimeString(),
                LastLoginAt = user.LastLoginAt.ToVietnamTimeString(),
                Roles = role == null ? [] : [role.Name],
                Permissions = permissions ?? [],
            };

            Staff? staff = await staffSqlRepository.AsQueryable()
                .FirstOrDefaultAsync(s => s.UserId == user.Id, cancellationToken);

            if (staff != null)
            {
                userDto.ProfileType = "Staff";
                userDto.FullName = staff.FullName;
                userDto.AvatarUrl = staff.AvatarUrl;
                userDto.Phone = staff.Phone;
                userDto.Gender = staff.Gender;
                userDto.DateOfBirth = staff.DateOfBirth;

                userDto.StaffInfo = new StaffProfileDto
                {
                    Code = staff.Code,
                    NationalId = staff.NationalId,
                    HireDate = staff.HireDate,
                    ContractType = staff.ContractType
                };
            }
            else
            {
                Customer? customer = await customerSqlRepository.AsQueryable()
                    .FirstOrDefaultAsync(c => c.UserId == user.Id, cancellationToken);

                if (customer != null)
                {
                    userDto.ProfileType = "Customer";
                    userDto.FullName = customer.FullName;
                    userDto.AvatarUrl = customer.AvatarUrl;
                    userDto.Phone = customer.Phone;
                    userDto.Gender = customer.Gender;
                    userDto.DateOfBirth = customer.DateOfBirth;

                    userDto.CustomerInfo = new CustomerProfileDto
                    {
                        Tier = customer.Tier,
                        LoyaltyPoint = customer.LoyaltyPoint,
                        FirstPurchaseAt = customer.FirstPurchaseAt,
                        Source = customer.Source
                    };
                }
            }

            return Result<UserDto>.Success(userDto);
        }
    }
}
