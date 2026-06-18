using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.StaffSalons.Commands.RemoveManager
{
    public class RemoveManagerHandler : IRequestHandler<RemoveManagerCommand, Result<object>>
    {
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public RemoveManagerHandler(IStaffSalonSqlRepository staffSalonSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(RemoveManagerCommand request, CancellationToken cancellationToken)
        {
            var staffSalon = await staffSalonSqlRepository.AsQueryable(asNoTracking: false)
                .Where(x => x.StaffId == request.StaffId && x.SalonId == request.SalonId && x.IsManager == true && x.Status == StaffSalonConst.STATUS_ACTIVE)
                .FirstOrDefaultAsync(cancellationToken);

            if (staffSalon == null)
                return Result<object>.NotFound("No active manager assignment found for this staff and salon.");

            staffSalon.EndDate = DateOnly.FromDateTime(DateTime.UtcNow);
            staffSalon.Status = StaffSalonConst.STATUS_INACTIVE;
            staffSalon.UpdatedAt = DateTimeHelper.UtcNow();
            staffSalon.UpdatedBy = request.UpdatedBy ?? 1;
            staffSalonSqlRepository.Update(staffSalon);

            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
            return Result<object>.Success("Manager removed successfully.");
        }
    }
}
