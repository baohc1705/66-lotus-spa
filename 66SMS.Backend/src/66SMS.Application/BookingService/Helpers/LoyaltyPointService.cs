using _66SMS.Application.Abstractions;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Helpers
{
    public class LoyaltyPointService : ILoyaltyPointService
    {
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IMembershipTierSqlRepository membershipTierSqlRepository;
        private readonly IMembershipCardSqlRepository membershipCardSqlRepository;
        private readonly IMembershipCardHistorySqlRepository membershipCardHistorySqlRepository;

        public LoyaltyPointService(
            ICustomerSqlRepository customerSqlRepository,
            IMembershipTierSqlRepository membershipTierSqlRepository,
            IMembershipCardSqlRepository membershipCardSqlRepository,
            IMembershipCardHistorySqlRepository membershipCardHistorySqlRepository)
        {
            this.customerSqlRepository = customerSqlRepository;
            this.membershipTierSqlRepository = membershipTierSqlRepository;
            this.membershipCardSqlRepository = membershipCardSqlRepository;
            this.membershipCardHistorySqlRepository = membershipCardHistorySqlRepository;
        }

        // Công thức: 1 điểm / 10,000 VND, nhân với hệ số hạng thẻ (ví dụ: hạng Gold nhân 1.5)
        // Làm tròn xuống để không trao điểm lẻ
        public int CalculateEarnedPoints(decimal amountPaid, decimal pointMultiplier)
        {
            if (amountPaid <= 0) return 0;
            return (int)Math.Floor((amountPaid / 10000m) * pointMultiplier);
        }

        // Cộng điểm tích lũy sau khi thanh toán và tự động nâng hạng thẻ nếu đủ điều kiện
        // Được gọi sau mỗi lần thanh toán thành công (thanh toán cuối, không phải cọc)
        public async Task AddPointsAndCheckUpgradeAsync(int customerUserId, decimal amountPaid, int userId, CancellationToken cancellationToken = default)
        {
            if (amountPaid <= 0) return;

            // Tải customer kèm thẻ thành viên để biết hệ số điểm hiện tại và hạng thẻ đang giữ
            var customer = await customerSqlRepository.AsQueryable(asNoTracking: false)
                .Include(c => c.MembershipCard)
                .ThenInclude(mc => mc!.Tier)
                .FirstOrDefaultAsync(c => c.UserId == customerUserId, cancellationToken);

            if (customer == null) return;

            // Lấy hệ số nhân điểm từ hạng thẻ, mặc định x1 nếu chưa có thẻ
            decimal multiplier = customer.MembershipCard?.Tier?.PointMultiplier ?? 1m;
            int earnedPoints = CalculateEarnedPoints(amountPaid, multiplier);

            if (earnedPoints <= 0) return;

            // Cộng điểm vào tổng tích lũy của khách
            customer.LoyaltyPoint = (customer.LoyaltyPoint ?? 0) + earnedPoints;
            customerSqlRepository.Update(customer);

            // Chưa có thẻ thành viên thì không có hạng để nâng, dừng tại đây
            if (customer.MembershipCard == null || customer.MembershipCard.Tier == null)
                return;

            // Lấy tất cả hạng thẻ đang hoạt động, sắp xếp theo MinSpending giảm dần
            // MinSpending ở đây đóng vai trò là ngưỡng điểm cần đạt để lên hạng (không phải tiền chi tiêu)
            var activeTiers = await membershipTierSqlRepository.AsQueryable()
                .Where(t => t.Status == MembershipTierConst.STATUS_ACTIVE)
                .OrderByDescending(t => t.MinSpending)
                .ToListAsync(cancellationToken);

            var currentTier = customer.MembershipCard.Tier;

            // Tìm hạng cao nhất mà điểm hiện tại của khách đạt được
            var eligibleTier = activeTiers.FirstOrDefault(t => customer.LoyaltyPoint >= t.MinSpending);

            // Chỉ nâng hạng, không bao giờ tự động hạ hạng (dù điểm bị trừ sau này)
            if (eligibleTier != null && eligibleTier.MinSpending > currentTier.MinSpending)
            {
                var oldTierId = currentTier.Id;
                var newTierId = eligibleTier.Id;

                // Cập nhật hạng thẻ mới cho khách
                customer.MembershipCard.MembershipTierId = newTierId;
                customer.MembershipCard.Tier = eligibleTier;
                membershipCardSqlRepository.Update(customer.MembershipCard);

                // Lưu lịch sử để admin theo dõi được lý do nâng hạng
                var history = new MembershipCardHistory
                {
                    MembershipCardId = customer.MembershipCard.Id,
                    OldTierId = oldTierId,
                    NewTierId = newTierId,
                    Reason = $"Tự động nâng hạng thẻ từ {currentTier.Name} lên {eligibleTier.Name} do đạt {customer.LoyaltyPoint} điểm",
                    ChangedBy = userId,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };
                membershipCardHistorySqlRepository.Add(history);
            }
        }
    }
}
