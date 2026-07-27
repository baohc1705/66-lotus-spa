using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Helpers
{
    public static class BookingPositionReleaseService
    {
        public static async Task ReleasePositionIfNeededAsync(
            Appointment appointment,
            IBookingPositionSqlRepository bookingPositionSqlRepository,
            CancellationToken cancellationToken)
        {
            if (!appointment.PositionId.HasValue)
                return;

            var position = await bookingPositionSqlRepository.AsQueryable()
                .FirstOrDefaultAsync(p => p.Id == appointment.PositionId.Value, cancellationToken);

            if (position == null)
                return;

            if (position.Status == BookingPositionConst.STATUS_IN_SERVICE)
            {
                BookingPositionHelper.MarkAvailable(position);
                bookingPositionSqlRepository.Update(position);
            }
        }
    }
}
