using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.SalonService.Staffs.Commands.UpdateStaff
{
    public class UpdateStaffHandler : IRequestHandler<UpdateStaffCommand, Result<object>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly IImageUploadService imageUploadService;
        private readonly ICacheService cacheService;

        public UpdateStaffHandler(
            IStaffSqlRepository staffSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IRoleSqlRepository roleSqlRepository,
            IUserRoleSqlRepository userRoleSqlRepository,
            IImageUploadService imageUploadService,
            ICacheService cacheService)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.roleSqlRepository = roleSqlRepository;
            this.userRoleSqlRepository = userRoleSqlRepository;
            this.imageUploadService = imageUploadService;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(UpdateStaffCommand request, CancellationToken cancellationToken)
        {
            Staff? staff = await staffSqlRepository
                .AsQueryable(false)
                .Include(x => x.User!)
                    .ThenInclude(u => u.UserRoles)
                .Include(x => x.StaffSalons)
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (staff == null)
                return Result<object>.NotFound(StaffConst.MSG_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            mapper.Map(request, staff);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (!string.IsNullOrEmpty(request.AvatarUrl))
                {
                    staff.AvatarUrl = await imageUploadService.UploadAsync(
                        request.AvatarUrl,
                        StaffConst.GenerateImageFileName(staff.Id),
                        StaffConst.IMAGE_FOLDER,
                        cancellationToken);
                }

                if (!string.IsNullOrEmpty(request.Role))
                {
                    if (staff.User == null)
                    {
                        transaction.Rollback();
                        return Result<object>.NotFound(UserConst.MSG_USER_NOT_FOUND, ErrorCodes.ERR_USER_NOT_FOUND);
                    }

                    var roleId = await roleSqlRepository
                        .AsQueryable(true)
                        .Where(x => x.Code == request.Role)
                        .Select(x => x.Id)
                        .FirstOrDefaultAsync(cancellationToken);

                    if (roleId == 0)
                    {
                        transaction.Rollback();
                        return Result<object>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);
                    }

                    staff.User.UserRoles ??= new List<UserRole>();

                    var rolesToRemove = staff.User.UserRoles
                        .Where(x => x.RoleId != roleId)
                        .ToList();

                    if (rolesToRemove.Count > 0)
                        userRoleSqlRepository.RemoveRange(rolesToRemove);

                    if (!staff.User.UserRoles.Any(x => x.RoleId == roleId))
                    {
                        staff.User.UserRoles.Add(new UserRole
                        {
                            UserId = staff.UserId,
                            RoleId = roleId,
                            AssignedAt = DateTimeHelper.UtcNow(),
                            AssignedBy = request.UpdatedBy,
                        });
                    }
                }

                bool isManagerRole = await IsManagerRoleAsync(staff, request.Role, cancellationToken);

                if (request.SalonId.HasValue)
                {
                    SyncStaffSalon(staff, request.SalonId.Value, isManagerRole);
                }
                else if (!string.IsNullOrEmpty(request.Role))
                {
                    staff.StaffSalons ??= new List<StaffSalon>();
                    foreach (var assignment in staff.StaffSalons.Where(x => x.Status == (int)StatusActiveEnum.ACTIVED))
                    {
                        assignment.IsManager = isManagerRole;
                        assignment.UpdatedAt = DateTimeHelper.UtcNow();
                    }
                }

                if (!string.IsNullOrEmpty(request.Email))
                {
                    if (staff.User == null)
                    {
                        transaction.Rollback();
                        return Result<object>.NotFound(UserConst.MSG_USER_NOT_FOUND, ErrorCodes.ERR_USER_NOT_FOUND);
                    }

                    staff.User.Email = request.Email;
                    staff.User.UpdatedAt = DateTimeHelper.UtcNow();
                    staff.User.UpdatedBy = request.UpdatedBy;
                }

                staffSqlRepository.Update(staff);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                var salonIds = staff.StaffSalons?
                    .Select(x => x.SalonId)
                    .Distinct()
                    .ToList() ?? new List<int>();
                if (request.SalonId.HasValue && !salonIds.Contains(request.SalonId.Value))
                    salonIds.Add(request.SalonId.Value);

                foreach (var salonId in salonIds)
                {
                    await cacheService.RemoveAsync(StaffConst.CacheKeyBySalon(salonId), cancellationToken);
                }

                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        private async Task<bool> IsManagerRoleAsync(
            Staff staff,
            string? requestRole,
            CancellationToken cancellationToken)
        {
            if (!string.IsNullOrEmpty(requestRole))
                return string.Equals(requestRole, RoleConst.CODE_MANAGER, StringComparison.OrdinalIgnoreCase);

            var managerRoleId = await roleSqlRepository
                .AsQueryable(true)
                .Where(x => x.Code == RoleConst.CODE_MANAGER)
                .Select(x => x.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (managerRoleId == 0 || staff.User?.UserRoles == null)
                return false;

            return staff.User.UserRoles.Any(x => x.RoleId == managerRoleId);
        }

        private static void SyncStaffSalon(Staff staff, int salonId, bool isManager)
        {
            staff.StaffSalons ??= new List<StaffSalon>();

            var activeAssignments = staff.StaffSalons
                .Where(x => x.Status == (int)StatusActiveEnum.ACTIVED)
                .ToList();

            var current = activeAssignments.FirstOrDefault(x => x.SalonId == salonId);
            if (current != null)
            {
                current.IsManager = isManager;
                current.UpdatedAt = DateTimeHelper.UtcNow();
                return;
            }

            foreach (var assignment in activeAssignments)
            {
                assignment.Status = (int)StatusActiveEnum.IACTIVED;
                assignment.EndDate = DateTimeHelper.UtcNow().ToDateOnly();
                assignment.UpdatedAt = DateTimeHelper.UtcNow();
                assignment.IsManager = false;
            }

            staff.StaffSalons.Add(new StaffSalon
            {
                StaffId = staff.Id,
                SalonId = salonId,
                IsManager = isManager,
                StartDate = DateTimeHelper.UtcNow().ToDateOnly(),
                Status = (int)StatusActiveEnum.ACTIVED,
                CreatedAt = DateTimeHelper.UtcNow(),
            });
        }
    }
}
