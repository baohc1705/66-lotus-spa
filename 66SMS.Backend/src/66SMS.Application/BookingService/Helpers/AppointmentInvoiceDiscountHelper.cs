using _66SMS.Domain.Entities;

namespace _66SMS.Application.BookingService.Helpers
{
    public static class AppointmentInvoiceDiscountHelper
    {
        public static (decimal MembershipDiscount, decimal PromoDiscount, int? MembershipTierId) Split(
            decimal subTotal,
            decimal appointmentTotalAmount,
            Customer? customer)
        {
            var tier = customer?.MembershipCard?.Tier;
            return Split(subTotal, appointmentTotalAmount, tier?.DiscountPercent ?? 0, tier?.Id);
        }

        public static (decimal MembershipDiscount, decimal PromoDiscount, int? MembershipTierId) Split(
            decimal subTotal,
            decimal appointmentTotalAmount,
            int discountPercent,
            int? membershipTierId = null)
        {
            var totalDiscount = subTotal - appointmentTotalAmount;
            if (totalDiscount < 0) totalDiscount = 0;
            if (totalDiscount == 0)
                return (0, 0, null);

            decimal membershipDiscount = 0;
            if (discountPercent > 0 && subTotal > 0)
            {
                membershipDiscount = Math.Round(subTotal * discountPercent / 100m, 0, MidpointRounding.AwayFromZero);
                if (membershipDiscount > totalDiscount)
                    membershipDiscount = totalDiscount;
            }

            var promoDiscount = totalDiscount - membershipDiscount;
            if (promoDiscount < 0) promoDiscount = 0;

            return (membershipDiscount, promoDiscount, membershipDiscount > 0 ? membershipTierId : null);
        }
    }
}
