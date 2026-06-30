using _66SMS.Application.Abstractions;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contracts.Abstractions;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace _66SMS.Application.BookingService.Cashier.Commands.VnPayIpn
{
    public sealed class VnPayIpnHandler(
        IVnPayService vnPayService,
        IAppointmentSqlRepository appointmentRepository,
        ILoyaltyPointService loyaltyPointService,
        ISqlUnitOfWork unitOfWork)
        : IRequestHandler<VnPayIpnCommand, VnPayIpnResponse>
    {
        public async Task<VnPayIpnResponse> Handle(VnPayIpnCommand request, CancellationToken cancellationToken)
        {
            // Bước 1: Parse dữ liệu từ URL Query String và kiểm tra chữ ký (Checksum) bằng HashSecret
            // Hàm PaymentExecute bên trong sẽ tự động xác thực vnp_SecureHash có hợp lệ hay không.
            var result = vnPayService.PaymentExecute(request.QueryData);

            // Nếu hàm PaymentExecute trả về Success = false và không có mã lỗi (VnPayResponseCode rỗng)
            // Có nghĩa là mã checksum (chữ ký) gửi lên đã bị sai lệch (có nguy cơ bị hack/sửa đổi request)
            if (!result.Success && string.IsNullOrEmpty(result.VnPayResponseCode))
            {
                // Trả về mã 97 theo chuẩn VNPAY để báo là Checksum không hợp lệ
                return VnPayIpnResponse.InvalidSignature();
            }

            // Bước 2: Truy vấn CSDL để tìm ra lịch hẹn (Appointment) tương ứng với AppointmentId gửi lên từ VNPAY
            var appointment = await appointmentRepository.AsQueryable()
                .Include(a => a.Histories)
                .Include(a => a.Payments)
                .FirstOrDefaultAsync(a => a.Id == result.AppointmentId, cancellationToken);

            // Nếu không tìm thấy lịch hẹn trong CSDL, trả về mã 01 báo Order Not Found
            if (appointment == null) return VnPayIpnResponse.OrderNotFound();

            // Bước 3: Kiểm tra xem đơn hàng này đã từng được xác nhận thanh toán trước đó chưa
            // (Đề phòng trường hợp IPN gọi lại lần 2, hoặc Return URL trên Frontend đã chạy xong trước khi IPN tới)
            bool isAlreadyConfirmed = false;
            
            // Phase_DEPOSIT: Khách hàng thanh toán tiền cọc
            if (result.Phase == AppointmentPaymentConst.PHASE_DEPOSIT)
            {
                // Nếu không còn ở trạng thái chờ cọc (PENDING) thì nghĩa là đã cọc rồi
                isAlreadyConfirmed = !AppointmentStatusTransitions.CanPayDeposit(appointment);
            }
            // Phase_FINAL_PAYMENT: Thu ngân thanh toán nốt phần còn lại của hóa đơn
            else
            {
                // Nếu không còn ở trạng thái UNPAID hoặc COMPLETED thì nghĩa là hóa đơn này đã thu xong tiền
                isAlreadyConfirmed = !AppointmentStatusTransitions.CanPayBalance(appointment.Status);
            }

            // Nếu phát hiện đơn hàng đã được cập nhật thanh toán thành công từ trước rồi
            if (isAlreadyConfirmed)
            {
                // Trả về mã 02 để báo cho VNPAY biết hệ thống đã ghi nhận đơn này rồi, không cần gọi lại nữa
                return VnPayIpnResponse.OrderAlreadyConfirmed();
            }

            // Có thể bổ sung kiểm tra số tiền khớp nhau (vnp_Amount) ở đây, nếu lệch thì trả về InvalidAmount() (Mã 04)

            // Bước 4: Kiểm tra trạng thái giao dịch thẻ của khách hàng (Mã "00" là thẻ trừ tiền thành công)
            if (result.Success)
            {
                // Gọi service để tự động tạo lịch sử thanh toán, ghi nhận thanh toán và đổi trạng thái lịch hẹn
                var apply = AppointmentPaymentApplyService.ApplyVnPaySuccess(appointment, result.Phase, result.TransactionId);
                
                // Đề phòng hàm Apply tự động check thấy điều kiện không thỏa mãn (ví dụ lỗi logic)
                if (!apply.IsSuccess)
                {
                    return VnPayIpnResponse.OrderAlreadyConfirmed();
                }

                // Add loyalty points if it's the final payment phase and was newly paid
                if (result.Phase == AppointmentPaymentConst.PHASE_FINAL_PAYMENT 
                    && apply.Data is bool isNewlyPaid && isNewlyPaid
                    && appointment.TotalAmount > 0)
                {
                    await loyaltyPointService.AddPointsAndCheckUpgradeAsync(
                        appointment.CreatedByUserId,
                        appointment.TotalAmount,
                        appointment.CreatedByUserId,
                        cancellationToken);
                }

                // Cập nhật sự thay đổi (Trạng thái đơn hàng, History) vào CSDL
                appointmentRepository.Update(appointment);
                // Lưu các thay đổi xuống database
                await unitOfWork.SaveChangeAsync(cancellationToken);
            }

            // Bước 5: Trả về kết quả cuối cùng cho VNPAY
            // Lưu ý: Dù thẻ khách trừ tiền thành công (00) hay thất bại do hủy thẻ (24), sai OTP...
            // Thì ở góc độ Server-to-Server, ta vẫn trả về "00" để báo cho VNPAY biết là "Tôi đã nhận được thông báo IPN này và xử lý xong".
            return VnPayIpnResponse.Success();
        }
    }
}
