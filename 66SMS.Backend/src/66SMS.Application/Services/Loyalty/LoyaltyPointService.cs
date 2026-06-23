using _66SMS.Application.Abstractions;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Services.Loyalty
{
    public class LoyaltyPointService : ILoyaltyPointService
    {
        private readonly ICustomerSqlRepository _customerSqlRepository;
        private readonly IMembershipTierSqlRepository _membershipTierSqlRepository;
        private readonly IMembershipCardSqlRepository _membershipCardSqlRepository;
        private readonly IMembershipCardHistorySqlRepository _membershipCardHistorySqlRepository;

        public LoyaltyPointService(
            ICustomerSqlRepository customerSqlRepository,
            IMembershipTierSqlRepository membershipTierSqlRepository,
            IMembershipCardSqlRepository membershipCardSqlRepository,
            IMembershipCardHistorySqlRepository membershipCardHistorySqlRepository)
        {
            _customerSqlRepository = customerSqlRepository;
            _membershipTierSqlRepository = membershipTierSqlRepository;
            _membershipCardSqlRepository = membershipCardSqlRepository;
            _membershipCardHistorySqlRepository = membershipCardHistorySqlRepository;
        }

        public int CalculateEarnedPoints(decimal amountPaid, decimal pointMultiplier)
        {
            if (amountPaid <= 0) return 0;
            // Công thức: 1 điểm cho mỗi 10,000 VND, nhân với hệ số của hạng thẻ hiện tại.
            // Sử dụng Math.Floor để làm tròn xuống số nguyên.
            return (int)Math.Floor((amountPaid / 10000m) * pointMultiplier);
        }

        public async Task AddPointsAndCheckUpgradeAsync(int customerUserId, decimal amountPaid, int userId, CancellationToken cancellationToken = default)
        {
            if (amountPaid <= 0) return;

            // 1. Lấy thông tin khách hàng kèm thẻ thành viên hiện tại
            var customer = await _customerSqlRepository.AsQueryable(asNoTracking: false)
                .Include(c => c.MembershipCard)
                .ThenInclude(mc => mc!.Tier)
                .FirstOrDefaultAsync(c => c.UserId == customerUserId, cancellationToken);

            if (customer == null) return;

            // Tính điểm dựa trên hạng thẻ
            decimal multiplier = customer.MembershipCard?.Tier?.PointMultiplier ?? 1m;
            int earnedPoints = CalculateEarnedPoints(amountPaid, multiplier);

            if (earnedPoints <= 0) return;

            // 2. Cộng điểm cho khách hàng
            customer.LoyaltyPoint = (customer.LoyaltyPoint ?? 0) + earnedPoints;
            _customerSqlRepository.Update(customer);

            // Nếu khách hàng chưa có thẻ, bỏ qua logic nâng hạng.
            if (customer.MembershipCard == null || customer.MembershipCard.Tier == null)
            {
                return;
            }

            // 3. Lấy tất cả các hạng thẻ đang Active, sắp xếp theo yêu cầu điểm (MinSpending) giảm dần
            // Logic: MinSpending đóng vai trò là mốc điểm (LoyaltyPoint) yêu cầu để đạt được hạng thẻ đó.
            var activeTiers = await _membershipTierSqlRepository.AsQueryable()
                .Where(t => t.Status == MembershipTierConst.STATUS_ACTIVE)
                .OrderByDescending(t => t.MinSpending)
                .ToListAsync(cancellationToken);

            var currentTier = customer.MembershipCard.Tier;

            // 4. Tìm hạng thẻ cao nhất mà điểm hiện tại của khách hàng đáp ứng được
            var eligibleTier = activeTiers.FirstOrDefault(t => customer.LoyaltyPoint >= t.MinSpending);

            // Nếu tìm thấy hạng thẻ thỏa mãn và hạng đó có yêu cầu điểm cao hơn hạng hiện tại
            // (Nghĩa là nâng hạng, không bao giờ rớt hạng tự động dù điểm có bị trừ sau này nếu có cơ chế dùng điểm)
            if (eligibleTier != null && eligibleTier.MinSpending > currentTier.MinSpending)
            {
                var oldTierId = currentTier.Id;
                var newTierId = eligibleTier.Id;

                // Cập nhật hạng thẻ mới
                customer.MembershipCard.MembershipTierId = newTierId;
                customer.MembershipCard.Tier = eligibleTier; // update navigation property for safety
                _membershipCardSqlRepository.Update(customer.MembershipCard);

                // Ghi nhận lịch sử nâng hạng
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
                _membershipCardHistorySqlRepository.Add(history);
            }
        }
    }
}
