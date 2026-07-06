using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using System.Data;

namespace _66SMS.Application.SalonService.Payrolls.Commands.UpdatePayroll
{
    public class UpdatePayrollHandler : IRequestHandler<UpdatePayrollCommand, Result<int>>
    {
        private readonly IPayrollSqlRepository payrollRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public UpdatePayrollHandler(IPayrollSqlRepository payrollRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.payrollRepository = payrollRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(UpdatePayrollCommand request, CancellationToken cancellationToken)
        {
            var payroll = await payrollRepository.FindByIdAsync(request.Id, asNoTracking: false, cancellationToken);
            if (payroll == null)
                return Result<int>.NotFound(PayrollConst.MSG_NOT_FOUND, ErrorCodes.ERR_PAYROLL_NOT_FOUND);

            if (request.BaseAmount.HasValue)
                payroll.BaseAmount = request.BaseAmount.Value;
            if (request.CommissionAmount.HasValue)
                payroll.CommissionAmount = request.CommissionAmount.Value;

            payroll.TotalAmount = payroll.BaseAmount + payroll.CommissionAmount;

            if (request.Note != null)
                payroll.Note = request.Note;

            if (request.Status.HasValue)
            {
                payroll.Status = request.Status.Value;
            }

            payroll.UpdatedAt = DateTime.UtcNow;
            payroll.UpdatedBy = request.UpdatedBy;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                payrollRepository.Update(payroll);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<int>.Success(payroll.Id, PayrollConst.MSG_UPDATE_SUCCESS);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
