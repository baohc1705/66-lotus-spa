namespace _66SMS.Application.Abstractions
{
    /// <summary>
    /// Service xử lý logic tích lũy điểm và tự động nâng hạng thẻ thành viên
    /// </summary>
    public interface ILoyaltyPointService
    {
        /// <summary>
        /// Tính điểm: (Số tiền / 10,000) * PointMultiplier.
        /// </summary>
        int CalculateEarnedPoints(decimal amountPaid, decimal pointMultiplier);

        /// <summary>
        /// Cộng điểm và nâng hạng khi equivalentSpending = LoyaltyPoint * 10,000 >= MinSpending.
        /// Caller cần SaveChangeAsync sau khi gọi.
        /// </summary>
        Task AddPointsAndCheckUpgradeAsync(int customerUserId, decimal amountPaid, int userId, CancellationToken cancellationToken = default);
    }
}
