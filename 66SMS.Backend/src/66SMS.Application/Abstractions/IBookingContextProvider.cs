using _66SMS.Application.BookingService.Helpers;

namespace _66SMS.Application.Abstractions
{
    public interface IBookingContextProvider
    {
        Task<AppointmentAvailabilityContext?> BuildContextAsync(DateOnly date, int serviceId, CancellationToken cancellationToken = default);
    }
}
