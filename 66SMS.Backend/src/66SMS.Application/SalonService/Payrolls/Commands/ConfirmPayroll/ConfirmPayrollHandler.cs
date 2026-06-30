using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using System.Data;

namespace _66SMS.Application.SalonService.Payrolls.Commands.ConfirmPayroll
{
    public class ConfirmPayrollHandler : IRequestHandler<ConfirmPayrollCommand, Result<int>>
    {
        private readonly IPayrollSqlRepository payrollRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public ConfirmPayrollHandler(IPayrollSqlRepository payrollRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.payrollRepository = payrollRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(ConfirmPayrollCommand request, CancellationToken cancellationToken)
        {
            var payroll = await payrollRepository.FindByIdAsync(request.Id, asNoTracking: false, cancellationToken);
            if (payroll == null)
                return Result<int>.NotFound(PayrollConst.MSG_NOT_FOUND, ErrorCodes.ERR_PAYROLL_NOT_FOUND);

            if (payroll.Status == PayrollConst.STATUS_CONFIRMED)
                return Result<int>.BadRequest(PayrollConst.MSG_ALREADY_CONFIRMED, ErrorCodes.ERR_PAYROLL_ALREADY_CONFIRMED);

            payroll.Status = PayrollConst.STATUS_CONFIRMED;
            payroll.UpdatedAt = DateTime.UtcNow;
            payroll.UpdatedBy = request.UpdatedBy;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                payrollRepository.Update(payroll);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<int>.Success(payroll.Id, PayrollConst.MSG_CONFIRM_SUCCESS);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
