using _66SMS.Application.Services.Appointments;

namespace _66SMS.Application.Abstractions
{
    public interface IBookingContextProvider
    {
        Task<AppointmentAvailabilityContext?> BuildContextAsync(DateOnly date, int serviceId, CancellationToken cancellationToken = default);
    }
}
