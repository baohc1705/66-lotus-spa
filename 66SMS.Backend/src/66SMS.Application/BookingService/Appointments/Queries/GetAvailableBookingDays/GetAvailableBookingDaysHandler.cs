using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetAvailableBookingDays
{
    public class GetAvailableBookingDaysHandler
        : IRequestHandler<GetAvailableBookingDaysQuery, Result<IReadOnlyList<BookingDayDto>>>
    {
        private static readonly string[] VietnameseDays =
            ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

        public Task<Result<IReadOnlyList<BookingDayDto>>> Handle(
            GetAvailableBookingDaysQuery request,
            CancellationToken cancellationToken)
        {
            var daysCount = request.Days <= 0 ? 7 : Math.Min(request.Days, 31);

            var todayVn = DateOnly.FromDateTime(DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7)).DateTime);

            var result = new List<BookingDayDto>(daysCount);

            for (var i = 0; i < daysCount; i++)
            {
                var date = todayVn.AddDays(i);
                var isToday = i == 0;

                result.Add(new BookingDayDto
                {
                    Date = date,
                    DayName = isToday ? "H.Nay" : VietnameseDays[(int)date.DayOfWeek],
                    DayNum = date.Day,
                    IsToday = isToday,
                    IsBookedOut = false,
                });
            }

            return Task.FromResult(Result<IReadOnlyList<BookingDayDto>>.Success(result));
        }
    }
}
