namespace _66SMS.Application.Abstractions
{
    /// <summary>
    /// Service xử lý logic tích lũy điểm và tự động nâng hạng thẻ thành viên
    /// </summary>
    public interface ILoyaltyPointService
    {
        /// <summary>
        /// Tính toán số điểm khách sẽ nhận được dựa trên số tiền thanh toán.
        /// Công thức: (Số tiền / 10,000) * PointMultiplier của thẻ hiện tại.
        /// </summary>
        /// <param name="amountPaid">Số tiền khách đã thanh toán</param>
        /// <param name="pointMultiplier">Hệ số nhân điểm của hạng thẻ hiện tại</param>
        /// <returns>Số điểm tích lũy nhận được</returns>
        int CalculateEarnedPoints(decimal amountPaid, decimal pointMultiplier);

        /// <summary>
        /// Thêm điểm cho khách hàng và tự động kiểm tra điều kiện nâng hạng.
        /// Việc nâng hạng được thực hiện bằng cách so sánh tổng điểm với MinSpending của các hạng thẻ.
        /// Lưu ý: Hàm này thay đổi State của các Entity (Customer, MembershipCard) thông qua Repositories.
        /// Handler gọi hàm này CẦN gọi UnitOfWork.SaveChangeAsync() sau đó để lưu vào DB.
        /// </summary>
        /// <param name="customerUserId">UserId của khách hàng (CreatedByUserId từ Appointment)</param>
        /// <param name="amountPaid">Số tiền khách đã thanh toán để tính điểm</param>
        /// <param name="userId">ID của User thao tác (để ghi log created_by)</param>
        /// <param name="cancellationToken">CancellationToken</param>
        Task AddPointsAndCheckUpgradeAsync(int customerUserId, decimal amountPaid, int userId, CancellationToken cancellationToken = default);
    }
}
