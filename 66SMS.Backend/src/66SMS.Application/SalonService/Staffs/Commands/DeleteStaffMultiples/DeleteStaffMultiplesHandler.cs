using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.SalonService.Staffs.Commands.DeleteStaffMultiples
{
    public class DeleteStaffMultiplesHandler : IRequestHandler<DeleteStaffMultiplesCommand, Result<object>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly ICacheService cacheService;

        public DeleteStaffMultiplesHandler(
            IStaffSqlRepository staffSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            ICacheService cacheService)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(DeleteStaffMultiplesCommand request, CancellationToken cancellationToken)
        {
            var requestIds = request.Ids.Distinct().ToList();
            var staffs = await staffSqlRepository
                .AsQueryable(false)
                .Include(x => x.User)
                .Include(x => x.StaffSalons)
                .Where(x => requestIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

            if (staffs.Count != requestIds.Count)
                return Result<object>.NotFound(StaffConst.MSG_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            var salonIds = new HashSet<int>();
            foreach (var staff in staffs)
            {
                staff.Status = StaffConst.STATUS_DELETED;
                if (staff.User != null)
                {
                    staff.User.Status = (int)StatusActiveEnum.DELETED;
                    staff.User.UpdatedAt = DateTimeHelper.UtcNow();
                    staff.User.UpdatedBy = request.UpdatedBy;
                }

                staffSqlRepository.Update(staff);

                if (staff.StaffSalons == null) continue;
                foreach (var assignment in staff.StaffSalons)
                {
                    salonIds.Add(assignment.SalonId);
                }
            }

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

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
    }
}
