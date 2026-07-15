using _66SMS.Application.BookingService.Helpers;

namespace _66SMS.Application.Abstractions
{
    public interface IBookingContextProvider
    {
        /// <param name="excludeLockId">Bỏ qua lock này khi merge held slots (dùng lúc confirm appointment bằng chính lock đó).</param>
        Task<AppointmentAvailabilityContext?> BuildContextAsync(
            DateOnly date,
            int serviceId,
            int? excludeLockId = null,
            CancellationToken cancellationToken = default);
    }
}
