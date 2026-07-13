using _66SMS.Contract.Abstractions;
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
        private readonly IImageUploadService imageUploadService;

        public CreateStaffHandler(
            IUserSqlRepository userSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IPasswordHash passwordHash,
            IRoleSqlRepository roleSqlRepository,
            IImageUploadService imageUploadService)
        {
            this.userSqlRepository = userSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.passwordHash = passwordHash;
            this.roleSqlRepository = roleSqlRepository;
            this.imageUploadService = imageUploadService;
        }

        public async Task<Result<object>> Handle(CreateStaffCommand request, CancellationToken cancellationToken)
        {
            string staffCode = await GenerateUniqueStaffCodeAsync(cancellationToken);
            string staffEmail = $"{staffCode}@lotusspa.com.vn";

            User? user = new User
            {
                Username = staffCode,
                Email = staffEmail,
                PasswordHash = passwordHash.Hash(staffCode),
                CreatedAt = DateTime.UtcNow,
                CreatedBy = request.CreatedBy,
                Status = (int)request.Status!,
            };

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
            };
            user.UserRoles = new List<UserRole> { userRole };

            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                request.AvatarUrl = null;

            Staff? staff = mapper.Map<Staff>(request);
            staff.Code = staffCode;

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

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                userSqlRepository.Add(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                staff.UserId = user.Id;
                staffSqlRepository.Add(staff);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    staff.AvatarUrl = await imageUploadService.UploadAsync(
                        request.ImageBase64,
                        StaffConst.GenerateImageFileName(staff.Id),
                        StaffConst.IMAGE_FOLDER,
                        cancellationToken);

                    if (!string.IsNullOrWhiteSpace(staff.AvatarUrl))
                    {
                        staffSqlRepository.Update(staff);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
                }

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
                .Where(x => x.Code!.StartsWith("SEN"))
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
