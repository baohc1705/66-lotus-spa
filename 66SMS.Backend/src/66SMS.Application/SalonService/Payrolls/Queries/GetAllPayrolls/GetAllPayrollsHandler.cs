using _66SMS.Application.DTOs.Payrolls;
using _66SMS.Application.SalonService.Helpers;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.SalonService.Payrolls.Queries.GetAllPayrolls
{
    public class GetAllPayrollsHandler : IRequestHandler<GetAllPayrollsQuery, Result<PagedResult<PayrollDTO>>>
    {
        private readonly IPayrollSqlRepository payrollRepository;

        public GetAllPayrollsHandler(IPayrollSqlRepository payrollRepository)
        {
            this.payrollRepository = payrollRepository;
        }

        public async Task<Result<PagedResult<PayrollDTO>>> Handle(GetAllPayrollsQuery request, CancellationToken cancellationToken)
        {
            var query = payrollRepository.AsQueryable();

            if (request.StaffId.HasValue)
                query = query.Where(x => x.StaffId == request.StaffId);

            if (request.SalonId.HasValue)
                query = query.Where(x => x.SalonId == request.SalonId);

            if (request.Month.HasValue)
                query = query.Where(x => x.PeriodMonth == request.Month);

            if (request.Year.HasValue)
                query = query.Where(x => x.PeriodYear == request.Year);

            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status);

            query = request.IsDescending
                ? query.OrderByDescending(x => x.PeriodYear).ThenByDescending(x => x.PeriodMonth).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.PeriodYear).ThenBy(x => x.PeriodMonth).ThenBy(x => x.Id);

            var result = await query
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
                })
                .ToPagedAsync(request, cancellationToken);

            foreach (var item in result.Items)
            {
                if (item.PeriodYear.HasValue && item.PeriodMonth.HasValue)
                {
                    item.StandardWorkDays = PayrollCalculator.GetStandardWorkDaysInMonth(
                        item.PeriodYear.Value,
                        item.PeriodMonth.Value,
                        PayrollConst.DEFAULT_EXCLUDE_SATURDAY);
                }
            }

            return Result<PagedResult<PayrollDTO>>.Success(result);
        }
    }
}
