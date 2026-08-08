using _66SMS.Application.DTOs.Payrolls;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.Payrolls.Queries.GetDetailPayroll
{
    public class GetDetailPayrollHandler : IRequestHandler<GetDetailPayrollQuery, Result<PayrollDTO>>
    {
        private readonly IPayrollSqlRepository payrollRepository;

        public GetDetailPayrollHandler(IPayrollSqlRepository payrollRepository)
        {
            this.payrollRepository = payrollRepository;
        }

        public async Task<Result<PayrollDTO>> Handle(GetDetailPayrollQuery request, CancellationToken cancellationToken)
        {
            var payroll = await payrollRepository
                .AsQueryable()
                .Where(x => x.Id == request.Id)
                .Select(x => new PayrollDTO
                {
                    Id = x.Id,
                    StaffId = x.StaffId,
                    StaffName = x.Staff != null ? x.Staff.FullName : null,
                    SalonId = x.SalonId,
                    SalonName = x.Salon != null ? x.Salon.Name : null,
                    PeriodMonth = x.PeriodMonth,
                    PeriodYear = x.PeriodYear,
                    SalaryType = x.SalaryType,
                    Rate = x.Rate,
                    TotalHours = x.TotalHours,
                    TotalWorkDays = x.TotalWorkDays,
                    TotalAmount = x.TotalAmount,
                    Status = x.Status,
                    Note = x.Note,
                    CreatedAt = x.CreatedAt.ToString(),
                    CreatedBy = x.CreatedBy,
                    UpdatedAt = x.UpdatedAt.ToString(),
                    UpdatedBy = x.UpdatedBy,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (payroll == null)
                return Result<PayrollDTO>.NotFound(PayrollConst.MSG_NOT_FOUND, ErrorCodes.ERR_PAYROLL_NOT_FOUND);

            return Result<PayrollDTO>.Success(payroll);
        }
    }
}
