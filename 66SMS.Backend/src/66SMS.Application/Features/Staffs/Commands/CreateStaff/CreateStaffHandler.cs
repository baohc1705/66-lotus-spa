using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.Features.Staffs.Commands.CreateStaff
{
    public class CreateStaffHandler : IRequestHandler<CreateStaffCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IPasswordHash passwordHash;

        public CreateStaffHandler(
            IUserSqlRepository userSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IPasswordHash passwordHash,
            IRoleSqlRepository roleSqlRepository,
            IUserRoleSqlRepository userRoleSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.passwordHash = passwordHash;
            this.roleSqlRepository = roleSqlRepository;
            this.userRoleSqlRepository = userRoleSqlRepository;
        }

        public async Task<Result<object>> Handle(CreateStaffCommand request, CancellationToken cancellationToken)
        {
            bool emailOrUsernameExisted = await userSqlRepository.AsQueryable()
                .Where(x => x.Email.Equals(request.Email) || x.Username.Equals(request.UserName))
                .AnyAsync(cancellationToken);

            if (emailOrUsernameExisted)
                return Result<object>.Conflict("Email or username existed", ErrorCodes.ERR_USER_ALREADY_EXISTS);

            User? user = mapper.Map<User>(request);
            user.PasswordHash = passwordHash.Hash(request.Password!);
            user.CreatedAt = DateTimeHelper.UtcNow();
            user.CreatedBy = request.CreatedBy;
            user.Status = UserConst.STATUS_ACTIVED;

            Staff? staff = mapper.Map<Staff>(request);
            staff.CreatedAt = DateTimeHelper.UtcNow();
            staff.CreatedBy = request.CreatedBy;
            staff.Status = StaffConst.STATUS_ACTIVED;

            staff.Code = await GenerateUniqueStaffCodeAsync(cancellationToken);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                userSqlRepository.Add(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                staff.UserId = user.Id;
                staffSqlRepository.Add(staff);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                string roleRequest = request.Role ?? "staff";
                Role? role = await roleSqlRepository.AsQueryable()
                    .Where(x => x.Name.Equals(roleRequest))
                    .FirstOrDefaultAsync(cancellationToken);

                if (role == null)
                    return Result<object>.BadRequest("Invalid role", ErrorCodes.ERR_ROLE_NOT_FOUND);

                UserRole userRole = new()
                {
                    UserId = user.Id,
                    RoleId = role.Id,
                    AssignedAt = DateTimeHelper.UtcNow(),
                    AssignedBy = request.CreatedBy ?? 1,
                    CreatedAt = DateTimeHelper.UtcNow(),
                    CreatedBy = request.CreatedBy ?? 1
                };

                userRoleSqlRepository.Add(userRole);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<object>.Created(staff.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        private async Task<string> GenerateUniqueStaffCodeAsync(CancellationToken cancellationToken)
        {
            Staff? staff = await staffSqlRepository.AsQueryable()
                .Where(x => x.Code.StartsWith("SEN"))
                .OrderByDescending(x => x.Code)
                .FirstOrDefaultAsync(cancellationToken);

            int nextNumber = 1;
            if (staff != null && !string.IsNullOrEmpty(staff.Code) && staff.Code.Length > 7)
            {
                string numberPart = staff.Code.Substring(7);
                if (int.TryParse(numberPart, out int parsedNumber))
                {
                    nextNumber = parsedNumber + 1;
                }
            }

            string newCode;
            bool isUnique = false;
            do
            {
                newCode = $"SEN{nextNumber:D4}";
                bool exists = await staffSqlRepository.AsQueryable()
                    .Where(x => x.Code == newCode)
                    .AnyAsync(cancellationToken);
                if (!exists) 
                    isUnique = true;
                else
                    nextNumber++;

            } while (!isUnique);

            return newCode;
        }
    }
}
