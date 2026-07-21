using _66SMS.Application.DTOs.Payrolls;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.Payrolls.Queries.GetPayrollCommissionStats
{
    public class GetPayrollCommissionStatsHandler
        : IRequestHandler<GetPayrollCommissionStatsQuery, Result<PayrollCommissionStatsDto>>
    {
        private readonly IPayrollSqlRepository payrollRepository;
        private readonly IStaffSqlRepository staffRepository;

        public GetPayrollCommissionStatsHandler(
            IPayrollSqlRepository payrollRepository,
            IStaffSqlRepository staffRepository)
        {
            this.payrollRepository = payrollRepository;
            this.staffRepository = staffRepository;
        }

        public async Task<Result<PayrollCommissionStatsDto>> Handle(
            GetPayrollCommissionStatsQuery request,
            CancellationToken cancellationToken)
        {
            var resolvedStaffId = await ResolveStaffIdAsync(request, cancellationToken);
            if (!resolvedStaffId.IsSuccess)
                return Result<PayrollCommissionStatsDto>.BadRequest(resolvedStaffId.Message);

            var staffId = resolvedStaffId.Data!;

            var staff = await staffRepository
                .AsQueryable()
                .Where(x => x.Id == staffId)
                .Select(x => new
                {
                    x.Id,
                    x.FullName,
                    x.BasicSalary,
                    x.SalaryType,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (staff == null)
                return Result<PayrollCommissionStatsDto>.NotFound(PayrollConst.MSG_STAFF_REQUIRED);

            var rows = await payrollRepository.GetCommissionStatsAsync(
                staffId,
                request.FromDate,
                request.ToDate,
                cancellationToken);

            var appointments = MapAppointments(rows);
            var totalCommission = appointments.Sum(a => a.TotalCommission);
            var basicSalary = staff.BasicSalary ?? 0;

            var dto = new PayrollCommissionStatsDto
            {
                StaffId = staff.Id,
                StaffName = staff.FullName,
                BasicSalary = staff.BasicSalary,
                SalaryType = staff.SalaryType,
                FromDate = request.FromDate.ToString("yyyy-MM-dd"),
                ToDate = request.ToDate.ToString("yyyy-MM-dd"),
                Appointments = appointments,
                Summary = new PayrollCommissionSummaryDto
                {
                    TotalAppointments = appointments.Count,
                    TotalServices = appointments.Sum(a => a.Lines.Count),
                    TotalCommission = totalCommission,
                    BasicSalary = staff.BasicSalary,
                    EstimatedTotal = basicSalary + totalCommission,
                },
            };

            return Result<PayrollCommissionStatsDto>.Success(dto);
        }

        private async Task<Result<int>> ResolveStaffIdAsync(
            GetPayrollCommissionStatsQuery request,
            CancellationToken cancellationToken)
        {
            if (request.IsAdmin)
            {
                if (!request.StaffId.HasValue || request.StaffId.Value <= 0)
                    return Result<int>.BadRequest(PayrollConst.MSG_STAFF_REQUIRED);

                return Result<int>.Success(request.StaffId.Value);
            }

            var myStaffId = await staffRepository
                .AsQueryable()
                .Where(x => x.UserId == request.UserId)
                .Select(x => (int?)x.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (!myStaffId.HasValue)
                return Result<int>.BadRequest(PayrollConst.MSG_STAFF_PROFILE_REQUIRED);

            return Result<int>.Success(myStaffId.Value);
        }

        private static List<PayrollCommissionAppointmentDto> MapAppointments(
            IReadOnlyList<PayrollCommissionStatRowDto> rows)
        {
            return rows
                .GroupBy(r => r.AppointmentId ?? -(r.InvoiceId ?? 0))
                .Select(g =>
                {
                    var first = g.First();
                    var lines = g.Select(MapLine).ToList();
                    var serviceName = string.Join(", ", lines
                        .Select(l => l.ItemName)
                        .Where(n => !string.IsNullOrWhiteSpace(n))
                        .Distinct());

                    // Giống StaffScheduleMapping: End = Start + DurationMins (không dùng SlotEndTime 30p)
                    var durationMins = first.DurationMins is > 0 ? first.DurationMins.Value : 15;
                    var startTime = first.SlotStartTime;
                    var endTime = startTime.HasValue
                        ? startTime.Value.AddMinutes(durationMins)
                        : first.SlotEndTime;

                    return new PayrollCommissionAppointmentDto
                    {
                        AppointmentId = first.AppointmentId,
                        AppointmentCode = first.AppointmentCode,
                        AppointmentDate = first.AppointmentDate,
                        IssuedLocalDate = first.IssuedLocalDate,
                        AppointmentStatus = first.AppointmentStatus,
                        AppointmentNote = first.AppointmentNote,
                        AppointmentTotalAmount = first.AppointmentTotalAmount,
                        AppointmentPaidAmount = first.AppointmentPaidAmount,
                        DepositPercent = first.DepositPercent,
                        CompletedAt = first.CompletedAt,
                        SlotId = first.SlotId,
                        SlotStartTime = startTime,
                        SlotEndTime = endTime,
                        DurationMins = durationMins,
                        PositionId = first.PositionId,
                        SalonId = first.AppointmentSalonId ?? first.InvoiceSalonId,
                        InvoiceId = first.InvoiceId,
                        InvoiceCode = first.InvoiceCode,
                        CustomerName = first.InvoiceCustomerName,
                        CustomerPhone = first.InvoiceCustomerPhone,
                        InvoiceTotalAmount = first.InvoiceTotalAmount,
                        InvoicePaidAmount = first.InvoicePaidAmount,
                        InvoicePaymentMethod = first.InvoicePaymentMethod,
                        InvoiceStatus = first.InvoiceStatus,
                        InvoiceIssuedAt = first.InvoiceIssuedAt,
                        ServiceName = serviceName,
                        TotalCommission = lines.Sum(l => l.CommissionAmount),
                        Lines = lines,
                    };
                })
                .OrderBy(a => a.IssuedLocalDate)
                .ThenBy(a => a.SlotStartTime)
                .ToList();
        }

        private static PayrollCommissionLineDto MapLine(PayrollCommissionStatRowDto row)
        {
            return new PayrollCommissionLineDto
            {
                InvoiceItemId = row.InvoiceItemId,
                ItemType = row.ItemType,
                ItemRefId = row.ItemRefId,
                ItemName = row.ItemName,
                UnitPrice = row.UnitPrice,
                Quantity = row.Quantity,
                DiscountAmount = row.ItemDiscountAmount,
                LineTotal = row.LineTotal,
                CommissionRate = row.CommissionRate,
                CommissionAmount = row.CommissionAmount ?? 0,
                Note = row.ItemNote,
            };
        }
    }
}
