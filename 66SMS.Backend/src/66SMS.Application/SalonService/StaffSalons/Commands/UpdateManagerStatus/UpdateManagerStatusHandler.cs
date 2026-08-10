using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.StaffSalons.Commands.UpdateManagerStatus
{
    public class UpdateManagerStatusHandler : IRequestHandler<UpdateManagerStatusCommand, Result<object>>
    {
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly ICacheService cacheService;

        public UpdateManagerStatusHandler(
            IStaffSalonSqlRepository staffSalonSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ISalonSqlRepository salonSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            ICacheService cacheService)
        {
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.salonSqlRepository = salonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(UpdateManagerStatusCommand request, CancellationToken cancellationToken)
        {
            if (!request.IsAssign)
            {
                var current = await staffSalonSqlRepository.AsQueryable(asNoTracking: false)
                    .Where(x => x.StaffId == request.StaffId
                        && x.SalonId == request.SalonId
                        && x.IsManager
                        && x.Status == StaffSalonConst.STATUS_ACTIVE)
                    .FirstOrDefaultAsync(cancellationToken);

                if (current == null)
                    return Result<object>.NotFound(StaffSalonConst.MSG_STAFF_SALON_MANAGER_NOT_FOUND, ErrorCodes.ERR_STAFF_SALON_MANAGER_NOT_FOUND);

                current.EndDate = DateTimeHelper.UtcNow().ToDateOnly();
                current.Status = StaffSalonConst.STATUS_INACTIVE;
                current.UpdatedAt = DateTimeHelper.UtcNow();
                staffSalonSqlRepository.Update(current);

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                await cacheService.RemoveAsync(StaffConst.CacheKeyBySalon(request.SalonId), cancellationToken);
                return Result<object>.Success("Manager removed successfully.");
            }

            var staff = await staffSqlRepository.FindByIdAsync(request.StaffId);
            if (staff == null)
                return Result<object>.NotFound(StaffSalonConst.MSG_STAFF_SALON_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            var salon = await salonSqlRepository.FindByIdAsync(request.SalonId);
            if (salon == null)
                return Result<object>.NotFound(StaffSalonConst.MSG_STAFF_SALON_SALON_NOT_FOUND, ErrorCodes.ERR_SALON_NOT_FOUND);

            var existingManagers = await staffSalonSqlRepository.AsQueryable(asNoTracking: false)
                .Where(x => x.SalonId == request.SalonId && x.IsManager && x.Status == StaffSalonConst.STATUS_ACTIVE)
                .ToListAsync(cancellationToken);

            foreach (var em in existingManagers)
            {
                em.EndDate = DateTimeHelper.UtcNow().ToDateOnly();
                em.Status = StaffSalonConst.STATUS_INACTIVE;
                em.UpdatedAt = DateTimeHelper.UtcNow();
                staffSalonSqlRepository.Update(em);
            }

            var existing = await staffSalonSqlRepository.AsQueryable(asNoTracking: false)
                .Where(x => x.StaffId == request.StaffId && x.SalonId == request.SalonId)
                .FirstOrDefaultAsync(cancellationToken);

            if (existing != null)
            {
                existing.IsManager = true;
                existing.Status = StaffSalonConst.STATUS_ACTIVE;
                existing.StartDate = DateTimeHelper.UtcNow().ToDateOnly();
                existing.EndDate = null;
                existing.UpdatedAt = DateTimeHelper.UtcNow();
                staffSalonSqlRepository.Update(existing);
            }
            else
            {
                staffSalonSqlRepository.Add(new StaffSalon
                {
                    StaffId = request.StaffId,
                    SalonId = request.SalonId,
                    IsManager = true,
                    StartDate = DateTimeHelper.UtcNow().ToDateOnly(),
                    Status = StaffSalonConst.STATUS_ACTIVE,
                    CreatedAt = DateTimeHelper.UtcNow(),
                });
            }

            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
            await cacheService.RemoveAsync(StaffConst.CacheKeyBySalon(request.SalonId), cancellationToken);
            return Result<object>.Success("Manager assigned successfully.");
        }
    }
}
