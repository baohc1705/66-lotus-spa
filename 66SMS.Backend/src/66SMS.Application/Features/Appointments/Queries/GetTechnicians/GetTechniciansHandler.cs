using _66SMS.Application.Abstractions;
using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Appointments.Queries.GetTechnicians
{
    public class GetTechniciansHandler : IRequestHandler<GetTechniciansQuery, Result<IReadOnlyList<BookingTechnicianDto>>>
    {
        private readonly IBookingAvailabilityService bookingAvailabilityService;

        public GetTechniciansHandler(IBookingAvailabilityService bookingAvailabilityService)
        {
            this.bookingAvailabilityService = bookingAvailabilityService;
        }

        /// <summary>
        /// Xử lý yêu cầu truy vấn danh sách kỹ thuật viên khả dụng.
        /// Chuyển tiếp yêu cầu sang service cốt lõi (BookingAvailabilityService).
        /// </summary>
        /// <param name="request">Yêu cầu lấy danh sách thợ (chứa Ngày và ServiceId).</param>
        /// <param name="cancellationToken">Token hủy tác vụ bất đồng bộ.</param>
        /// <returns>Danh sách kỹ thuật viên rảnh rỗi trong ngày.</returns>
        public async Task<Result<IReadOnlyList<BookingTechnicianDto>>> Handle(GetTechniciansQuery request, CancellationToken cancellationToken)
        {
            var result = await bookingAvailabilityService.GetTechniciansAsync(request.Date.Value, request.ServiceId, cancellationToken);
            return Result<IReadOnlyList<BookingTechnicianDto>>.Success(result);
        }
    }
}
