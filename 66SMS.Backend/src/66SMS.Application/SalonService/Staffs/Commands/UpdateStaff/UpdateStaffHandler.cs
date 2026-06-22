using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using System;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace _66SMS.Application.SalonService.Staffs.Commands.UpdateStaff
{
    public class UpdateStaffHandler : IRequestHandler<UpdateStaffCommand, Result<object>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;

        public UpdateStaffHandler(
            IStaffSqlRepository staffSqlRepository,
            IUserSqlRepository userSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IRoleSqlRepository roleSqlRepository,
            IUserRoleSqlRepository userRoleSqlRepository,
            IStaffSalonSqlRepository staffSalonSqlRepository)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.roleSqlRepository = roleSqlRepository;
            this.userRoleSqlRepository = userRoleSqlRepository;
            this.staffSalonSqlRepository = staffSalonSqlRepository;
        }

        public async Task<Result<object>> Handle(UpdateStaffCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                Staff? staff = await staffSqlRepository.FindByIdAsync((int)request.Id!, false);
                if (staff == null)
                    return Result<object>.NotFound();

                mapper.Map(request, staff);
                staff.UpdatedAt = DateTime.UtcNow;
                staff.UpdatedBy = request.UpdatedBy;
                staffSqlRepository.Update(staff);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Update StaffSalon relationship if SalonId has changed
                if (request.SalonId.HasValue)
                {
                    var activeAssignments = await staffSalonSqlRepository.AsQueryable()
                        .Where(x => x.StaffId == staff.Id && x.Status == StaffSalonConst.STATUS_ACTIVE)
                        .ToListAsync(cancellationToken);

                    // If request.SalonId is not in the active assignments, deactivate existing ones and add a new one
                    if (!activeAssignments.Any(x => x.SalonId == request.SalonId.Value))
                    {
                        foreach (var assignment in activeAssignments)
                        {
                            assignment.Status = StaffSalonConst.STATUS_INACTIVE;
                            assignment.EndDate = DateOnly.FromDateTime(DateTime.UtcNow);
                            assignment.UpdatedAt = DateTime.UtcNow;
                            assignment.UpdatedBy = request.UpdatedBy;
                            staffSalonSqlRepository.Update(assignment);
                        }

                        var newAssignment = new StaffSalon
                        {
                            StaffId = staff.Id,
                            SalonId = request.SalonId.Value,
                            IsManager = false,
                            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                            Status = StaffSalonConst.STATUS_ACTIVE,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = request.UpdatedBy ?? 1
                        };
                        staffSalonSqlRepository.Add(newAssignment);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
                }

                if (request.UserName != null || request.Email != null)
                {
                    User? user = await userSqlRepository.FindByIdAsync(staff.UserId, false);
                    if (user != null)
                    {
                        mapper.Map(request, user);
                        user.UpdatedAt = DateTime.UtcNow;
                        user.UpdatedBy = request.UpdatedBy;
                        userSqlRepository.Update(user);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
                }

                // Update UserRole
                if (!string.IsNullOrEmpty(request.Role))
                {
                    var role = await roleSqlRepository.AsQueryable()
                        .Where(x => x.Name.ToLower() == request.Role.ToLower())
                        .FirstOrDefaultAsync(cancellationToken);

                    if (role == null)
                    {
                        return Result<object>.BadRequest("Vai trò không hợp lệ.");
                    }

                    var currentRole = await userRoleSqlRepository.AsQueryable()
                        .Where(x => x.UserId == staff.UserId)
                        .FirstOrDefaultAsync(cancellationToken);

                    if (currentRole != null)
                    {
                        if (currentRole.RoleId != role.Id)
                        {
                            currentRole.RoleId = role.Id;
                            userRoleSqlRepository.Update(currentRole);
                            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                        }
                    }
                    else
                    {
                        UserRole userRole = new()
                        {
                            UserId = staff.UserId,
                            RoleId = role.Id,
                            AssignedAt = DateTime.UtcNow,
                            AssignedBy = request.UpdatedBy ?? 1,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = request.UpdatedBy ?? 1
                        };
                        userRoleSqlRepository.Add(userRole);
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
    }
}
