using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.SalonService.Payrolls.Commands.GeneratePayroll
{
    public class GeneratePayrollHandler : IRequestHandler<GeneratePayrollCommand, Result<int>>
    {
        private readonly IPayrollSqlRepository payrollRepository;
        private readonly IAttendanceSqlRepository attendanceRepository;
        private readonly IStaffSqlRepository staffRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public GeneratePayrollHandler(
            IPayrollSqlRepository payrollRepository,
            IAttendanceSqlRepository attendanceRepository,
            IStaffSqlRepository staffRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.payrollRepository = payrollRepository;
            this.attendanceRepository = attendanceRepository;
            this.staffRepository = staffRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(GeneratePayrollCommand request, CancellationToken cancellationToken)
        {
            var staff = await staffRepository.FindByIdAsync(request.StaffId, asNoTracking: true, cancellationToken);
            if (staff == null)
                return Result<int>.NotFound(StaffConst.MSG_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            var rate = staff.BasicSalary ?? 0;
            var salaryType = staff.SalaryType;

            // Chỉ tính các ngày đã check-out (ca hoàn tất) trong kỳ.
            var workedHoursList = await attendanceRepository
                .AsQueryable()
                .Where(x => x.StaffId == request.StaffId
                    && x.CheckOutAt != null
                    && x.WorkDate.Month == request.Month
                    && x.WorkDate.Year == request.Year)
                .Select(x => x.WorkedHours)
                .ToListAsync(cancellationToken);

            if (workedHoursList.Count == 0)
                return Result<int>.BadRequest(PayrollConst.MSG_NO_ATTENDANCE, ErrorCodes.ERR_PAYROLL_NO_ATTENDANCE);

            var totalHours = workedHoursList.Sum();
            var totalWorkDays = workedHoursList.Sum(h => ConvertToWorkDay(h));

            var totalAmount = salaryType == PayrollConst.SALARY_TYPE_HOURLY
                ? totalHours * rate
                : totalWorkDays * rate;

            // Upsert theo (staff, year, month).
            var payroll = await payrollRepository
                .AsQueryable(asNoTracking: false)
                .Where(x => x.StaffId == request.StaffId
                    && x.PeriodYear == request.Year
                    && x.PeriodMonth == request.Month)
                .FirstOrDefaultAsync(cancellationToken);

            if (payroll != null && payroll.Status == PayrollConst.STATUS_CONFIRMED)
                return Result<int>.BadRequest(PayrollConst.MSG_ALREADY_CONFIRMED, ErrorCodes.ERR_PAYROLL_ALREADY_CONFIRMED);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (payroll == null)
                {
                    payroll = new Payroll
                    {
                        StaffId = request.StaffId,
                        SalonId = staff.StaffSalons != null && staff.StaffSalons.Count > 0 ? staff.StaffSalons[0].SalonId : null,
                        PeriodMonth = request.Month,
                        PeriodYear = request.Year,
                        SalaryType = salaryType,
                        Rate = rate,
                        TotalHours = totalHours,
                        TotalWorkDays = totalWorkDays,
                        TotalAmount = totalAmount,
                        Status = PayrollConst.STATUS_DRAFT,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = request.CreatedBy,
                    };
                    payrollRepository.Add(payroll);
                }
                else
                {
                    payroll.SalaryType = salaryType;
                    payroll.Rate = rate;
                    payroll.TotalHours = totalHours;
                    payroll.TotalWorkDays = totalWorkDays;
                    payroll.TotalAmount = totalAmount;
                    payroll.UpdatedAt = DateTime.UtcNow;
                    payroll.UpdatedBy = request.CreatedBy;
                    payrollRepository.Update(payroll);
                }

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<int>.Success(payroll.Id, PayrollConst.MSG_GENERATE_SUCCESS);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        // Quy đổi số giờ làm trong 1 ngày ra số công.
        private static decimal ConvertToWorkDay(decimal workedHours)
        {
            if (workedHours >= PayrollConst.HALF_DAY_THRESHOLD)
                return 1.0m;
            if (workedHours > 0)
                return 0.5m;
            return 0m;
        }
    }
}
