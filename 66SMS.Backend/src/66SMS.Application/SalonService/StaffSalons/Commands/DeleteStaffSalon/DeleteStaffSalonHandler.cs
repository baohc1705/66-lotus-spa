using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

namespace _66SMS.Application.SalonService.StaffSalons.Commands.DeleteStaffSalon
{
    public class DeleteStaffSalonHandler : IRequestHandler<DeleteStaffSalonCommand, Result<object>>
    {
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly ICacheService cacheService;

        public DeleteStaffSalonHandler(
            IStaffSalonSqlRepository staffSalonSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            ICacheService cacheService)
        {
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(DeleteStaffSalonCommand request, CancellationToken cancellationToken)
        {
            StaffSalon? staffSalon = await staffSalonSqlRepository.FindByIdAsync((int)request.Id!);
            if (staffSalon == null)
                return Result<object>.NotFound(StaffSalonConst.MSG_STAFF_SALON_NOT_FOUND, ErrorCodes.ERR_STAFF_SALON_NOT_FOUND);

            var salonId = staffSalon.SalonId;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                staffSalonSqlRepository.Remove(staffSalon);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                await cacheService.RemoveAsync(StaffConst.CacheKeyBySalon(salonId), cancellationToken);
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
