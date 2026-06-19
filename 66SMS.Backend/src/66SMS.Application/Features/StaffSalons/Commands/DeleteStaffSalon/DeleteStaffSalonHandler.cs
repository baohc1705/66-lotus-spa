using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.StaffSalons.Commands.DeleteStaffSalon
{
    public class DeleteStaffSalonHandler : IRequestHandler<DeleteStaffSalonCommand, Result<object>>
    {
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteStaffSalonHandler(
            IStaffSalonSqlRepository staffSalonSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteStaffSalonCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                StaffSalon? staffSalon = await staffSalonSqlRepository.FindByIdAsync((int)request.Id);
                if (staffSalon == null)
                    return Result<object>.NotFound(StaffSalonConst.MSG_STAFF_SALON_NOT_FOUND, ErrorCodes.ERR_STAFF_SALON_NOT_FOUND);

                staffSalon.Status = StaffSalonConst.STATUS_DELETED;
                staffSalon.UpdatedAt = DateTimeHelper.UtcNow();
                staffSalon.UpdatedBy = request.UpdatedBy;
                staffSalonSqlRepository.Update(staffSalon);

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
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
