using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.Payrolls.Queries.GetPayrollCommissionDailyStats
{
    public class GetPayrollCommissionDailyStatsHandler
        : IRequestHandler<GetPayrollCommissionDailyStatsQuery, Result<PayrollCommissionDailyStatsDto>>
    {
        private readonly IPayrollSqlRepository payrollRepository;
        private readonly IStaffSqlRepository staffRepository;

        public GetPayrollCommissionDailyStatsHandler(
            IPayrollSqlRepository payrollRepository,
            IStaffSqlRepository staffRepository)
        {
            this.payrollRepository = payrollRepository;
            this.staffRepository = staffRepository;
        }

        public async Task<Result<PayrollCommissionDailyStatsDto>> Handle(
            GetPayrollCommissionDailyStatsQuery request,
            CancellationToken cancellationToken)
        {
            var resolvedStaffId = await ResolveStaffIdAsync(request, cancellationToken);
            if (!resolvedStaffId.IsSuccess)
                return Result<PayrollCommissionDailyStatsDto>.BadRequest(resolvedStaffId.Message);

            var staffId = resolvedStaffId.Data!;

            var staff = await staffRepository
                .AsQueryable()
                .Where(x => x.Id == staffId)
                .Select(x => new { x.Id, x.FullName, x.BasicSalary, x.SalaryType })
                .FirstOrDefaultAsync(cancellationToken);

            if (staff == null)
                return Result<PayrollCommissionDailyStatsDto>.NotFound(PayrollConst.MSG_STAFF_REQUIRED);

            var rows = await payrollRepository.GetCommissionDailyStatsAsync(
                staffId,
                request.FromDate,
                request.ToDate,
                cancellationToken);

            var items = rows
                .Select(r => new PayrollCommissionDailyDto
                {
                    WorkDate = r.WorkDate,
                    OrderCount = r.OrderCount,
                    ServiceHours = r.ServiceHours,
                    TotalCommission = r.TotalCommission,
                })
                .ToList();

            var totalCommission = items.Sum(x => x.TotalCommission);
            var basicSalary = staff.BasicSalary ?? 0;

            return Result<PayrollCommissionDailyStatsDto>.Success(new PayrollCommissionDailyStatsDto
            {
                StaffId = staff.Id,
                StaffName = staff.FullName,
                BasicSalary = staff.BasicSalary,
                SalaryType = staff.SalaryType,
                FromDate = request.FromDate.ToString("yyyy-MM-dd"),
                ToDate = request.ToDate.ToString("yyyy-MM-dd"),
                Items = items,
                Summary = new PayrollCommissionDailySummaryDto
                {
                    TotalOrders = items.Sum(x => x.OrderCount),
                    TotalServiceHours = items.Sum(x => x.ServiceHours),
                    TotalCommission = totalCommission,
                    BasicSalary = staff.BasicSalary,
                    EstimatedTotal = basicSalary + totalCommission,
                },
            });
        }

        private async Task<Result<int>> ResolveStaffIdAsync(
            GetPayrollCommissionDailyStatsQuery request,
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
    }
}
