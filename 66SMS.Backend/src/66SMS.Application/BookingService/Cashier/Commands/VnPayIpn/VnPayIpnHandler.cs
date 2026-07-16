using _66SMS.Application.Abstractions;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contracts.Abstractions;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Commands.VnPayIpn
{
    public sealed class VnPayIpnHandler(
        IVnPayService vnPayService,
        IAppointmentSqlRepository appointmentRepository,
        IWalletSqlRepository walletRepository,
        IWalletTransactionSqlRepository walletTransactionRepository,
        ILoyaltyPointService loyaltyPointService,
        ISqlUnitOfWork unitOfWork)
        : IRequestHandler<VnPayIpnCommand, VnPayIpnResponse>
    {
        public async Task<VnPayIpnResponse> Handle(VnPayIpnCommand request, CancellationToken cancellationToken)
        {
            // Bước 1: Parse dữ liệu từ URL Query String và kiểm tra chữ ký (Checksum) bằng HashSecret
            var result = vnPayService.PaymentExecute(request.QueryData);

            // Checksum không hợp lệ
            if (!result.Success && string.IsNullOrEmpty(result.VnPayResponseCode))
            {
                return VnPayIpnResponse.InvalidSignature();
            }

            // Nhánh nạp ví
            if (result.IsWalletTopUp)
            {
                if (result.WalletId <= 0)
                    return VnPayIpnResponse.OrderNotFound();

                var walletExists = await walletRepository.AsQueryable(asNoTracking: true)
                    .AnyAsync(w => w.Id == result.WalletId, cancellationToken);

                if (!walletExists)
                    return VnPayIpnResponse.OrderNotFound();

                if (result.Success)
                {
                    var topUp = await WalletTopUpApplyService.ApplyAsync(
                        result.WalletId,
                        result.Amount,
                        result.PaymentId,
                        walletRepository,
                        walletTransactionRepository,
                        cancellationToken);

                    if (!topUp.IsSuccess && topUp.Code == 404)
                        return VnPayIpnResponse.OrderNotFound();

                    // Đã ghi nhận trước đó (Return chạy trước IPN) → mã 02
                    if (topUp.IsSuccess && topUp.Data is bool isNewlyCredited && !isNewlyCredited)
                        return VnPayIpnResponse.OrderAlreadyConfirmed();

                    if (topUp.IsSuccess && topUp.Data is bool newly && newly)
                        await unitOfWork.SaveChangeAsync(cancellationToken);
                }

                return VnPayIpnResponse.Success();
            }

            // Bước 2: Truy vấn CSDL để tìm ra lịch hẹn tương ứng
            var appointment = await appointmentRepository.AsQueryable()
                .Include(a => a.Payments)
                .FirstOrDefaultAsync(a => a.Id == result.AppointmentId, cancellationToken);

            if (appointment == null)
                return VnPayIpnResponse.OrderNotFound();

            // Bước 3: Kiểm tra đơn đã xác nhận trước đó chưa
            bool isAlreadyConfirmed;
            if (result.Phase == AppointmentPaymentConst.PHASE_DEPOSIT)
            {
                // Nếu không còn ở trạng thái chờ cọc (PENDING) thì nghĩa là đã cọc rồi
                isAlreadyConfirmed = !AppointmentStatusTransitions.CanPayDeposit(appointment);
            }
            else
            {
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

                appointmentRepository.Update(appointment);
                await unitOfWork.SaveChangeAsync(cancellationToken);
            }

            return VnPayIpnResponse.Success();
        }
    }
}
