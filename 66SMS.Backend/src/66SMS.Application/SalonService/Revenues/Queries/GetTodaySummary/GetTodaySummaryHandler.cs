using _66SMS.Application.DTOs.Revenues;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetTodaySummary
{
    public class GetTodaySummaryHandler
        : IRequestHandler<GetTodaySummaryQuery, Result<TodaySummaryDto>>
    {
        private readonly IRevenueSqlRepository revenueRepository;

        public GetTodaySummaryHandler(IRevenueSqlRepository revenueRepository)
        {
            this.revenueRepository = revenueRepository;
        }

        public async Task<Result<TodaySummaryDto>> Handle(
            GetTodaySummaryQuery request,
            CancellationToken cancellationToken)
        {
            // Ngày local VN (+07)
            var todayVn = DateOnly.FromDateTime(
                DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7)).DateTime);

            var row = await revenueRepository.GetTodaySummaryAsync(
                request.SalonId,
                todayVn,
                cancellationToken);

            if (row == null)
            {
                return Result<TodaySummaryDto>.Success(new TodaySummaryDto());
            }

            var dto = new TodaySummaryDto
            {
                Appointments = new TodayAppointmentsDto
                {
                    Total = row.AppointmentsTotal,
                    Completed = row.AppointmentsCompleted,
                    CompletionRate = row.CompletionRate,
                    ChangeVsYesterday = row.ChangeVsYesterday,
                },
                Customers = new TodayCustomersDto
                {
                    Total = row.CustomersTotal,
                    NewCustomers = row.NewCustomers,
                    Returning = row.ReturningCustomers,
                    Lapsed = row.LapsedCustomers,
                },
                Cash = new TodayCashDto
                {
                    GrossRevenue = row.GrossRevenue,
                    CashOut = row.CashOut,
                    NetRevenue = row.NetRevenue,
                },
            };

            return Result<TodaySummaryDto>.Success(dto);
        }
    }
}
