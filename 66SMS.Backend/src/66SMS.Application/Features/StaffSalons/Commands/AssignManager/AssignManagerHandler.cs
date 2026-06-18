using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.Features.StaffSalons.Commands.AssignManager
{
    public class AssignManagerHandler : IRequestHandler<AssignManagerCommand, Result<object>>
    {
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public AssignManagerHandler(
            IStaffSalonSqlRepository staffSalonSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ISalonSqlRepository salonSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.salonSqlRepository = salonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(AssignManagerCommand request, CancellationToken cancellationToken)
        {
            var staff = await staffSqlRepository.FindByIdAsync(request.StaffId);
            if (staff == null)
                return Result<object>.NotFound("Staff not found.");

            var salon = await salonSqlRepository.FindByIdAsync(request.SalonId);
            if (salon == null)
                return Result<object>.NotFound("Salon not found.");

            // Deactivate any existing manager for this salon
            var existingManagers = await staffSalonSqlRepository.AsQueryable(asNoTracking: false)
                .Where(x => x.SalonId == request.SalonId && x.IsManager == true && x.Status == StaffSalonConst.STATUS_ACTIVE)
                .ToListAsync(cancellationToken);

            foreach (var em in existingManagers)
            {
                em.EndDate = DateOnly.FromDateTime(DateTime.UtcNow);
                em.Status = StaffSalonConst.STATUS_INACTIVE;
                em.UpdatedAt = DateTimeHelper.UtcNow();
                em.UpdatedBy = request.CreatedBy ?? 1;
                staffSalonSqlRepository.Update(em);
            }

            // Check if this staff already has a record for this salon
            var existing = await staffSalonSqlRepository.AsQueryable(asNoTracking: false)
                .Where(x => x.StaffId == request.StaffId && x.SalonId == request.SalonId)
                .FirstOrDefaultAsync(cancellationToken);

            if (existing != null)
            {
                existing.IsManager = true;
                existing.Status = StaffSalonConst.STATUS_ACTIVE;
                existing.StartDate = DateOnly.FromDateTime(DateTime.UtcNow);
                existing.EndDate = null;
                existing.UpdatedAt = DateTimeHelper.UtcNow();
                existing.UpdatedBy = request.CreatedBy ?? 1;
                staffSalonSqlRepository.Update(existing);
            }
            else
            {
                var staffSalon = new StaffSalon
                {
                    StaffId = request.StaffId,
                    SalonId = request.SalonId,
                    IsManager = true,
                    StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                    Status = StaffSalonConst.STATUS_ACTIVE,
                    CreatedAt = DateTimeHelper.UtcNow(),
                    CreatedBy = request.CreatedBy ?? 1,
                };
                staffSalonSqlRepository.Add(staffSalon);
            }

            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
            return Result<object>.Success("Manager assigned successfully.");
        }
    }
}
