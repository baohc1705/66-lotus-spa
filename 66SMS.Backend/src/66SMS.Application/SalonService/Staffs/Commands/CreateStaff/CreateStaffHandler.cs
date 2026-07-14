using _66SMS.Contract.Abstractions;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
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
        private readonly ICacheService cacheService;

        public CreateStaffHandler(
            IUserSqlRepository userSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IPasswordHash passwordHash,
            IRoleSqlRepository roleSqlRepository,
            IImageUploadService imageUploadService,
            ICacheService cacheService)
        {
            this.userSqlRepository = userSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.passwordHash = passwordHash;
            this.roleSqlRepository = roleSqlRepository;
            this.imageUploadService = imageUploadService;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(CreateStaffCommand request, CancellationToken cancellationToken)
        {
            User user = new User
            {
                Username = string.Empty,
                Email = string.Empty,
                PasswordHash = string.Empty,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = request.CreatedBy,
                Status = (int)StatusActiveEnum.ACTIVED,
            };

            string roleCode = request.Role ?? RoleConst.CODE_STAFF;
            var role = await roleSqlRepository
                .AsQueryable(true)
                .Where(x => x.Code == roleCode)
                .Select(x => new { x.Id, x.Code })
                .FirstOrDefaultAsync(cancellationToken);

            if (role == null)
                return Result<object>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);

            // Role manager + có chi nhánh → IsManager = true
            int salonId = request.SalonId ?? 1;
            bool isManager = role.Code == RoleConst.CODE_MANAGER;

            user.UserRoles = new List<UserRole>
            {
                new UserRole
                {
                    RoleId = role.Id,
                    AssignedAt = DateTimeOffset.UtcNow,
                    AssignedBy = request.CreatedBy,
                }
            };

            Staff staff = mapper.Map<Staff>(request);
            staff.Code = string.Empty;
            staff.AvatarUrl = string.Empty;
            staff.StaffSalons = new List<StaffSalon>
            {
                new StaffSalon
                {
                    SalonId = salonId,
                    StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                    CreatedAt = DateTimeOffset.UtcNow,
                    Status = (int)StatusActiveEnum.ACTIVED,
                    IsManager = isManager,
                }
            };

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                userSqlRepository.Add(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                staff.UserId = user.Id;
                staffSqlRepository.Add(staff);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                staff.Code = $"SEN{staff.Id:D4}";
                staff.User!.Username = staff.Code;
                staff.User.Email = string.IsNullOrEmpty(request.Email)
                    ? $"{staff.Code}@lotusspa.com.vn"
                    : request.Email;
                staff.User.PasswordHash = passwordHash.Hash(staff.Code);

                if (!string.IsNullOrEmpty(request.AvatarUrl))
                {
                    staff.AvatarUrl = await imageUploadService.UploadAsync(
                        request.AvatarUrl,
                        StaffConst.GenerateImageFileName(staff.Id),
                        StaffConst.IMAGE_FOLDER,
                        cancellationToken);
                }

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                await cacheService.RemoveAsync(StaffConst.CacheKeyBySalon(salonId), cancellationToken);
                return Result<object>.Created(staff.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
