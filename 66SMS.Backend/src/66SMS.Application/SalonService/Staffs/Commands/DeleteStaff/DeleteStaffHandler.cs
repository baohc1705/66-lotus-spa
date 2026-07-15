using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.SalonService.Staffs.Commands.DeleteStaff
{
    public class DeleteStaffHandler : IRequestHandler<DeleteStaffCommand, Result<object>>
    {
        
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly ICacheService cacheService;

        public DeleteStaffHandler(
            IStaffSqlRepository staffSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            ICacheService cacheService)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(DeleteStaffCommand request, CancellationToken cancellationToken)
        {
            Staff? staff = await staffSqlRepository
                .AsQueryable(false)
                .Include(x => x.User)
                .Include(x => x.StaffSalons)
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (staff == null)
                return Result<object>.NotFound(StaffConst.MSG_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            staff.Status = StaffConst.STATUS_DELETED;
            staff.User!.Status = (int)StatusActiveEnum.DELETED;
            staff.User.UpdatedAt = DateTimeHelper.UtcNow();
            staff.User.UpdatedBy = request.UpdatedBy;

            var salonIds = staff.StaffSalons?
                .Select(x => x.SalonId)
                .Distinct()
                .ToList() ?? new List<int>();

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                staffSqlRepository.Update(staff);
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
