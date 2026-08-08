using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.Abstractions.Services;

namespace _66SMS.Application.BookingService.Helpers
{
    public class LoyaltyPointService : ILoyaltyPointService
    {
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IMembershipTierSqlRepository membershipTierSqlRepository;
        private readonly IMembershipCardSqlRepository membershipCardSqlRepository;

        // 1 điểm = 10.000 VND
        private const decimal PointsToSpendingRate = 10000m;

        public LoyaltyPointService(
            ICustomerSqlRepository customerSqlRepository,
            IMembershipTierSqlRepository membershipTierSqlRepository,
            IMembershipCardSqlRepository membershipCardSqlRepository)
        {
            this.customerSqlRepository = customerSqlRepository;
            this.membershipTierSqlRepository = membershipTierSqlRepository;
            this.membershipCardSqlRepository = membershipCardSqlRepository;
        }

        // Công thức: 1 điểm / 10,000 VND, nhân hệ số hạng thẻ
        public int CalculateEarnedPoints(decimal amountPaid, decimal pointMultiplier)
        {
            if (amountPaid <= 0) return 0;
            return (int)Math.Floor((amountPaid / PointsToSpendingRate) * pointMultiplier);
        }

        public async Task AddPointsAndCheckUpgradeAsync(int customerUserId, decimal amountPaid, int userId, CancellationToken cancellationToken = default)
        {
            if (amountPaid <= 0) return;

            var customer = await customerSqlRepository.AsQueryable(asNoTracking: false)
                .Include(c => c.MembershipCard)
                .ThenInclude(mc => mc!.Tier)
                .FirstOrDefaultAsync(c => c.UserId == customerUserId, cancellationToken);

            if (customer == null) return;

            decimal multiplier = customer.MembershipCard?.Tier?.PointMultiplier ?? 1m;
            int earnedPoints = CalculateEarnedPoints(amountPaid, multiplier);

            if (earnedPoints <= 0) return;

            customer.LoyaltyPoint = (customer.LoyaltyPoint ?? 0) + earnedPoints;
            customerSqlRepository.Update(customer);

            if (customer.MembershipCard == null || customer.MembershipCard.Tier == null)
                return;

            decimal equivalentSpending = (customer.LoyaltyPoint ?? 0) * PointsToSpendingRate;

            var activeTiers = await membershipTierSqlRepository.AsQueryable()
                .Where(t => t.Status == MembershipTierConst.STATUS_ACTIVE)
                .OrderByDescending(t => t.MinSpending)
                .ToListAsync(cancellationToken);

            var currentTier = customer.MembershipCard.Tier;
            var eligibleTier = activeTiers.FirstOrDefault(t => equivalentSpending >= t.MinSpending);

            // Chỉ nâng hạng, không tự hạ hạng
            if (eligibleTier != null && eligibleTier.MinSpending > currentTier.MinSpending)
            {
                customer.MembershipCard.MembershipTierId = eligibleTier.Id;
                customer.MembershipCard.Tier = eligibleTier;
                membershipCardSqlRepository.Update(customer.MembershipCard);
            }
        }
    }
}
