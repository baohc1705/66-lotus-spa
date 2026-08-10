using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.BookingService.Helpers
{
    public static class CustomerUserEnsureHelper
    {
        public static async Task<Result<int>> EnsureCustomerUserIdAsync(
            Customer customer,
            string? email,
            IUserSqlRepository userSqlRepository,
            IRoleSqlRepository roleSqlRepository,
            ICustomerSqlRepository customerSqlRepository,
            IPasswordHash passwordHash,
            ISqlUnitOfWork sqlUnitOfWork,
            int? createdByUserId,
            CancellationToken cancellationToken)
        {
            if (customer.UserId.HasValue && customer.UserId.Value > 0)
                return Result<int>.Success(customer.UserId.Value);

            if (string.IsNullOrWhiteSpace(customer.Phone))
                return Result<int>.BadRequest(CustomerConst.MSG_CUSTOMER_PHONE_REQUIRED, ErrorCodes.ERR_CUSTOMER_INVALID);

            var phone = customer.Phone.Trim();

            var existingByPhone = await userSqlRepository.AsQueryable(true)
                .Where(u => u.Username == phone)
                .Select(u => u.Id)
                .FirstOrDefaultAsync(cancellationToken);
            if (existingByPhone > 0)
            {
                customer.UserId = existingByPhone;
                customer.UpdatedAt = DateTimeHelper.UtcNow();
                customerSqlRepository.Update(customer);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                return Result<int>.Success(existingByPhone);
            }

            if (string.IsNullOrWhiteSpace(email))
                return Result<int>.BadRequest(CustomerConst.MSG_CUSTOMER_EMAIL_REQUIRED, ErrorCodes.ERR_CUSTOMER_INVALID);

            var emailTrim = email.Trim();

            var existed = await userSqlRepository.AsQueryable(true)
                .AnyAsync(u => u.Username == phone || u.Email == emailTrim, cancellationToken);

            if (existed)
                return Result<int>.Conflict(UserConst.MSG_USER_ALREADY_EXISTS, ErrorCodes.ERR_USER_ALREADY_EXISTS);

            var roleId = await roleSqlRepository.AsQueryable(true)
                .Where(x => x.Code == RoleConst.CODE_CUSTOMER && x.Status == RoleConst.STATUS_ACTIVED)
                .Select(x => x.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (roleId == 0)
                return Result<int>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);

            var user = new User
            {
                Username = phone,
                Email = emailTrim,
                PasswordHash = passwordHash.Hash(phone),
                IsEmailConfirmed = true,
                Status = (int)StatusActiveEnum.ACTIVED,
                CreatedAt = DateTimeHelper.UtcNow(),
                CreatedBy = createdByUserId,
                UserRoles = new List<UserRole>
                {
                    new UserRole
                    {
                        RoleId = roleId,
                        AssignedAt = DateTimeHelper.UtcNow(),
                        AssignedBy = createdByUserId,
                    }
                }
            };

            userSqlRepository.Add(user);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            customer.UserId = user.Id;
            customer.UpdatedAt = DateTimeHelper.UtcNow();
            customerSqlRepository.Update(customer);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<int>.Success(user.Id);
        }
    }
}
