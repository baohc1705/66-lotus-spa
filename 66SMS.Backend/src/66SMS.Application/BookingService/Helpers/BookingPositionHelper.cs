using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.BookingService.Helpers
{
    public static class BookingPositionHelper
    {
        public static bool IsAvailable(int status) =>
            status == BookingPositionConst.STATUS_AVAILABLE
            || status == BookingPositionConst.STATUS_ACTIVED;

        public static void MarkInService(BookingPosition position)
        {
            position.Status = BookingPositionConst.STATUS_IN_SERVICE;
            position.UpdatedAt = Contracts.Helpers.DateTimeHelper.UtcNow();
        }

        public static void MarkAvailable(BookingPosition position)
        {
            position.Status = BookingPositionConst.STATUS_AVAILABLE;
            position.UpdatedAt = Contracts.Helpers.DateTimeHelper.UtcNow();
        }
    }
}
