using _66SMS.Application.DTOs.Appointments;

namespace _66SMS.Application.Abstractions
{
    /// <summary>
    /// Service cốt lõi xử lý logic tính toán tính khả dụng của nhân viên và khung giờ (Availability Logic).
    /// Hỗ trợ tìm kiếm nhân viên, lấy danh sách slot rảnh và phân giải tự động nhân viên khi đặt lịch.
    /// </summary>
    public interface IBookingAvailabilityService
    {
        /// <summary>
        /// Lấy danh sách các kỹ thuật viên (Staff) có khả năng thực hiện dịch vụ trong ngày được chọn.
        /// Danh sách trả về bao gồm cả option "Bất kỳ kỹ thuật viên nào" (Id = null) được xếp đầu tiên.
        /// </summary>
        /// <param name="date">Ngày khách hàng muốn đặt lịch.</param>
        /// <param name="serviceId">ID của dịch vụ Spa muốn đặt (Dùng để tính thời lượng cần thiết).</param>
        /// <param name="ct">Hủy tác vụ bất đồng bộ.</param>
        /// <returns>Danh sách kỹ thuật viên kèm theo số slot trống thực tế của họ trong ngày.</returns>
        Task<IReadOnlyList<BookingTechnicianDto>> GetTechniciansAsync(DateOnly date, int serviceId, CancellationToken cancellationToken = default);
        /// <summary>
        /// Lấy danh sách trạng thái của tất cả các khung giờ trong ngày (Khả dụng / Kín lịch / Hết giờ làm).
        /// Trạng thái sẽ được tính toán dựa trên tổng thời lượng của Service.
        /// </summary>
        /// <param name="date">Ngày khách hàng muốn đặt lịch.</param>
        /// <param name="serviceId">ID của dịch vụ Spa muốn đặt (Dùng để kiểm tra xem từ khung giờ đó trở đi có đủ thời gian làm dịch vụ không).</param>
        /// <param name="staffId">ID của nhân viên cụ thể (Nếu null, hệ thống sẽ gộp khung giờ khả dụng cho "Bất kỳ nhân viên nào").</param>
        /// <param name="ct">Hủy tác vụ bất đồng bộ.</param>
        /// <returns>Danh sách các khung giờ (Slot) kèm theo trạng thái tương ứng (available, booked, outside).</returns>
        Task<IReadOnlyList<BookingTimeSlotDto>> GetTimeSlotsAsync(DateOnly date, int serviceId, int? staffId, CancellationToken cancellationToken = default);
        /// <summary>
        /// Xử lý logic chốt nhân viên khi khách hàng thực hiện Đặt lịch hoặc Khóa Slot (Lock).
        /// Ngăn chặn tình trạng Double-Booking bằng cách xác nhận lại tính khả dụng realtime ngay trước khi ghi vào Database.
        /// </summary>
        /// <param name="date">Ngày thực hiện đặt lịch.</param>
        /// <param name="serviceId">ID dịch vụ để lấy thời lượng tính toán số lượng Slot liên tiếp bị chiếm.</param>
        /// <param name="staffId">ID nhân viên được chọn (Truyền null nếu khách chọn "Bất kỳ nhân viên nào").</param>
        /// <param name="startSlotId">ID của Slot bắt đầu mà khách hàng bấm chọn trên UI.</param>
        /// <param name="ct">Hủy tác vụ bất đồng bộ.</param>
        /// <returns>
        /// Trả về Tuple chứa StaffId thực tế được chọn và ScheduleId (Lịch làm việc của nhân viên đó hôm đó). 
        /// Nếu không còn bất kỳ nhân viên nào rảnh hoặc Slot đó đã bị người khác đặt mất, sẽ trả về null.
        /// </returns>
        Task<(int StaffId, int? ScheduleId)?> ResolveStaffAsync(DateOnly date, int serviceId, int? staffId, int startSlotId, CancellationToken ct = default);
    }
}
