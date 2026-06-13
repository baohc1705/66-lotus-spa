using _66SMS.Application.Abstractions;
using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Appointments.Queries.GetTimeSlots
{
    public class GetTimeSlotsHandler : IRequestHandler<GetTimeSlotsQuery, Result<IReadOnlyList<BookingTimeSlotDto>>>
    {
        private readonly IBookingAvailabilityService bookingAvailabilityService;

        public GetTimeSlotsHandler(IBookingAvailabilityService bookingAvailabilityService)
        {
            this.bookingAvailabilityService = bookingAvailabilityService;
        }

        /// <summary>
        /// Xử lý yêu cầu truy vấn danh sách các khung giờ trống.
        /// Chuyển tiếp yêu cầu sang service cốt lõi (BookingAvailabilityService).
        /// </summary>
        /// <param name="request">Yêu cầu lấy danh sách khung giờ (chứa Ngày, ServiceId và tùy chọn StaffId).</param>
        /// <param name="cancellationToken">Token hủy tác vụ bất đồng bộ.</param>
        /// <returns>Danh sách khung giờ kèm theo trạng thái (available, booked, outside).</returns>
        public async Task<Result<IReadOnlyList<BookingTimeSlotDto>>> Handle(GetTimeSlotsQuery request, CancellationToken cancellationToken)
        {
            var result = await bookingAvailabilityService.GetTimeSlotsAsync((DateOnly)request.Date, (int)request.ServiceId, request.StaffId, cancellationToken);
            return Result<IReadOnlyList<BookingTimeSlotDto>>.Success(result);
        }
    }
}
