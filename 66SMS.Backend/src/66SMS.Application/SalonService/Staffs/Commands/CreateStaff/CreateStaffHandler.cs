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

namespace _66SMS.Application.SalonService.Staffs.Commands.CreateStaff
{
    public class CreateStaffHandler : IRequestHandler<CreateStaffCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IRoleSqlRepository roleSqlRepository;
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
            IRoleSqlRepository roleSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.passwordHash = passwordHash;
            this.roleSqlRepository = roleSqlRepository;
        }

        public async Task<Result<object>> Handle(CreateStaffCommand request, CancellationToken cancellationToken)
        {
            // generate code and email for staff
            string staffCode = await GenerateUniqueStaffCodeAsync(cancellationToken);
            string staffEmail = $"{staffCode}@lotusspa.com.vn";

            // Create user account for staff
            User? user = new User
            {
                Username = staffCode,
                Email = staffEmail,
                PasswordHash = passwordHash.Hash(staffCode),
                CreatedAt = DateTime.UtcNow,
                CreatedBy = request.CreatedBy,
                Status = (int)request.Status!,
            };

            // create role for staff
            string roleRequest = request.Role ?? "staff";
            Role? role = await roleSqlRepository.AsQueryable()
                .Where(x => x.Name.Equals(roleRequest))
                .FirstOrDefaultAsync(cancellationToken);

            if (role == null)
                return Result<object>.BadRequest(UserConst.MSG_USER_INVALID_ROLE, ErrorCodes.ERR_ROLE_NOT_FOUND);

            UserRole userRole = new()
            {
                UserId = user.Id,
                RoleId = role.Id,
                AssignedAt = DateTimeHelper.UtcNow(),
                AssignedBy = request.CreatedBy ?? 1,
                CreatedAt = DateTimeHelper.UtcNow(),
            };
            user.UserRoles = new List<UserRole> { userRole };

            // map request to domain entity
            Staff? staff = mapper.Map<Staff>(request);
            staff.Code = staffCode;

            // Assign staff to salon if request has provived salon id
            if (request.SalonId.HasValue)
            {
                staff.StaffSalons = new List<StaffSalon>
                {
                    new StaffSalon
                    {
                        SalonId = request.SalonId.Value,
                        StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                        CreatedAt = DateTime.UtcNow,
                        Status = StaffSalonConst.STATUS_ACTIVE,
                    }
                };
            }

            // begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // save and persist user to database
                userSqlRepository.Add(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // save and persist staff to database
                staff.UserId = user.Id;
                staffSqlRepository.Add(staff);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // commit transaction
                transaction.Commit();

                // return staff id was created
                return Result<object>.Created(staff.Id);
            }
            catch
            {
                // Rollback on failure
                transaction.Rollback();
                throw;
            }
        }

        private async Task<string> GenerateUniqueStaffCodeAsync(CancellationToken cancellationToken)
        {
            // find first staff with code order by descending => last code
            Staff? staff = await staffSqlRepository.AsQueryable()
                .Where(x => x.Code!.StartsWith("SEN"))
                .OrderByDescending(x => x.Code)
                .FirstOrDefaultAsync(cancellationToken);

            int nextNumber = 1;
            if (staff != null && !string.IsNullOrEmpty(staff.Code) && staff.Code.Length > 7)
            {
                // get number last code then add one number
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
                // create new code with next number
                newCode = $"SEN{nextNumber:D4}";

                // check if new code exisited
                bool exists = await staffSqlRepository.AsQueryable()
                    .Where(x => x.Code == newCode)
                    .AnyAsync(cancellationToken);

                // if not existed then newCode is unique else increment 1
                if (!exists)
                    isUnique = true;
                else
                    nextNumber++;

            } while (!isUnique); // loop util find new code is unique

            return newCode;
        }
    }
}
