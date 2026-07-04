using _66SMS.Application.SalonService.Helpers;
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
        private readonly IInvoiceSqlRepository invoiceRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public GeneratePayrollHandler(
            IPayrollSqlRepository payrollRepository,
            IAttendanceSqlRepository attendanceRepository,
            IStaffSqlRepository staffRepository,
            IInvoiceSqlRepository invoiceRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.payrollRepository = payrollRepository;
            this.attendanceRepository = attendanceRepository;
            this.staffRepository = staffRepository;
            this.invoiceRepository = invoiceRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(GeneratePayrollCommand request, CancellationToken cancellationToken)
        {
            var staff = await staffRepository.FindByIdAsync(request.StaffId, asNoTracking: true, cancellationToken);
            if (staff == null)
                return Result<int>.NotFound(StaffConst.MSG_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            var rate = staff.BasicSalary ?? 0;
            var salaryType = staff.SalaryType;
            var excludeSaturday = request.ExcludeSaturday ?? PayrollConst.DEFAULT_EXCLUDE_SATURDAY;

            var attendances = await attendanceRepository
                .AsQueryable(asNoTracking: false)
                .Include(x => x.WorkSchedule!)
                .ThenInclude(w => w.ShiftPeriod)
                .Where(x => x.StaffId == request.StaffId
                    && x.WorkDate.Month == request.Month
                    && x.WorkDate.Year == request.Year)
                .ToListAsync(cancellationToken);

            var relevantAttendances = attendances
                .Where(a => AttendanceWorkCreditCalculator.IsManualStatus(a.Status)
                    || (a.CheckInAt.HasValue && a.CheckOutAt.HasValue))
                .ToList();

            if (relevantAttendances.Count == 0)
                return Result<int>.BadRequest(PayrollConst.MSG_NO_ATTENDANCE, ErrorCodes.ERR_PAYROLL_NO_ATTENDANCE);

            var totalHours = relevantAttendances
                .Where(a => a.CheckOutAt.HasValue)
                .Sum(a => a.WorkedHours);

            var totalWorkDays = relevantAttendances
                .Sum(a => AttendanceWorkCreditCalculator.CalculateWorkCredit(a));

            var standardWorkDays = PayrollCalculator.GetStandardWorkDaysInMonth(
                request.Year, request.Month, excludeSaturday);

            if (standardWorkDays <= 0)
                return Result<int>.BadRequest(PayrollConst.MSG_INVALID_STANDARD_DAYS, ErrorCodes.ERR_PAYROLL_INVALID_STANDARD_DAYS);

            var baseAmount = salaryType == PayrollConst.SALARY_TYPE_HOURLY
                ? totalHours * rate
                : PayrollCalculator.CalculateDailySalary(rate, standardWorkDays, totalWorkDays);

            var commissionAmount = await invoiceRepository.AsQueryable(asNoTracking: true)
                .Where(i => i.Status == InvoiceConst.STATUS_PAID
                    && i.IssuedAt.Month == request.Month
                    && i.IssuedAt.Year == request.Year)
                .SelectMany(i => i.Items!)
                .Where(item => item.StaffId == request.StaffId)
                .SumAsync(item => item.CommissionAmount, cancellationToken);

            var totalAmount = baseAmount + commissionAmount;

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
                        BaseAmount = baseAmount,
                        CommissionAmount = commissionAmount,
                        TotalAmount = totalAmount,
                        Status = PayrollConst.STATUS_DRAFT,
                        Note = BuildPayrollNote(standardWorkDays, excludeSaturday, commissionAmount),
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
                    payroll.BaseAmount = baseAmount;
                    payroll.CommissionAmount = commissionAmount;
                    payroll.TotalAmount = totalAmount;
                    payroll.Note = MergePayrollNote(payroll.Note, standardWorkDays, excludeSaturday, commissionAmount);
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

        private static string BuildPayrollNote(int standardWorkDays, bool excludeSaturday, decimal commissionAmount)
        {
            var weekendRule = excludeSaturday ? "T7+CN" : "CN";
            var commNote = commissionAmount > 0 ? $" Hoa hồng: {commissionAmount:N0}đ." : string.Empty;
            return $"Ngày công chuẩn: {standardWorkDays} (trừ {weekendRule}).{commNote}";
        }

        private static string? MergePayrollNote(
            string? existingNote,
            int standardWorkDays,
            bool excludeSaturday,
            decimal commissionAmount)
        {
            var standardNote = BuildPayrollNote(standardWorkDays, excludeSaturday, commissionAmount);
            if (string.IsNullOrWhiteSpace(existingNote))
                return standardNote;

            if (existingNote.Contains("Ngày công chuẩn:"))
                return existingNote;

            return $"{standardNote} {existingNote}".Trim();
        }
    }
}
