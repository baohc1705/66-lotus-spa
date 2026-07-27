using _66SMS.Domain.Entities;

namespace _66SMS.Application.BookingService.Helpers
{
    /// <summary>
    /// Tách giảm giá thẻ thành viên vs mã khuyến mãi khi tạo hóa đơn từ lịch hẹn.
    /// </summary>
    public static class AppointmentInvoiceDiscountHelper
    {
        public static (decimal MembershipDiscount, decimal PromoDiscount, int? MembershipTierId) Split(
            decimal subTotal,
            decimal appointmentTotalAmount,
            string? appointmentNote,
            Customer? customer)
        {
            var totalDiscount = subTotal - appointmentTotalAmount;
            if (totalDiscount < 0) totalDiscount = 0;
            if (totalDiscount == 0)
                return (0, 0, null);

            var tier = customer?.MembershipCard?.Tier;
            var tierId = tier?.Id;
            var discountPercent = tier?.DiscountPercent ?? 0;

            decimal membershipDiscount = 0;
            if (discountPercent > 0 && subTotal > 0)
            {
                membershipDiscount = Math.Round(subTotal * discountPercent / 100m, 0, MidpointRounding.AwayFromZero);
                if (membershipDiscount > totalDiscount)
                    membershipDiscount = totalDiscount;
            }

            var hasPromo = !string.IsNullOrWhiteSpace(appointmentNote)
                && appointmentNote.Contains("[Đã áp dụng mã:", StringComparison.Ordinal);

            
            if (!hasPromo)
            {
                return (totalDiscount, 0, membershipDiscount > 0 ? tierId : null);
            }

           
            var promoDiscount = totalDiscount - membershipDiscount;
            if (promoDiscount < 0) promoDiscount = 0;

            return (membershipDiscount, promoDiscount, membershipDiscount > 0 ? tierId : null);
        }
    }
}
