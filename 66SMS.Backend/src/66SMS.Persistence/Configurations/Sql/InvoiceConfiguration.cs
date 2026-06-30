using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
    {
        public void Configure(EntityTypeBuilder<Invoice> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(InvoiceConst.FIELD_ID);
            builder.Property(x => x.InvoiceCode).HasColumnName(InvoiceConst.FIELD_INVOICE_CODE).HasMaxLength(InvoiceConst.CODE_MAX_LENGTH);
            builder.Property(x => x.CustomerId).HasColumnName(InvoiceConst.FIELD_CUSTOMER_ID);
            builder.Property(x => x.CustomerName).HasColumnName(InvoiceConst.FIELD_CUSTOMER_NAME).HasMaxLength(InvoiceConst.CUSTOMER_NAME_MAX_LENGTH);
            builder.Property(x => x.CustomerPhone).HasColumnName(InvoiceConst.FIELD_CUSTOMER_PHONE).HasMaxLength(InvoiceConst.CUSTOMER_PHONE_MAX_LENGTH);
            builder.Property(x => x.AppointmentId).HasColumnName(InvoiceConst.FIELD_APPOINTMENT_ID);
            builder.Property(x => x.SalonId).HasColumnName(InvoiceConst.FIELD_SALON_ID);
            builder.Property(x => x.CashierId).HasColumnName(InvoiceConst.FIELD_CASHIER_ID);
            builder.Property(x => x.SubTotal).HasColumnName(InvoiceConst.FIELD_SUB_TOTAL).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.DiscountAmount).HasColumnName(InvoiceConst.FIELD_DISCOUNT_AMOUNT).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.MembershipTierId).HasColumnName(InvoiceConst.FIELD_MEMBERSHIP_TIER_ID);
            builder.Property(x => x.MembershipDiscountAmount).HasColumnName(InvoiceConst.FIELD_MEMBERSHIP_DISCOUNT_AMOUNT).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.LoyaltyPointsUsed).HasColumnName(InvoiceConst.FIELD_LOYALTY_POINTS_USED);
            builder.Property(x => x.LoyaltyPointsValue).HasColumnName(InvoiceConst.FIELD_LOYALTY_POINTS_VALUE).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.LoyaltyPointsEarned).HasColumnName(InvoiceConst.FIELD_LOYALTY_POINTS_EARNED);
            builder.Property(x => x.TaxAmount).HasColumnName(InvoiceConst.FIELD_TAX_AMOUNT).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.TotalAmount).HasColumnName(InvoiceConst.FIELD_TOTAL_AMOUNT).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.PaidAmount).HasColumnName(InvoiceConst.FIELD_PAID_AMOUNT).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.ChangeAmount).HasColumnName(InvoiceConst.FIELD_CHANGE_AMOUNT).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.PaymentMethod).HasColumnName(InvoiceConst.FIELD_PAYMENT_METHOD);
            builder.Property(x => x.TransactionId).HasColumnName(InvoiceConst.FIELD_TRANSACTION_ID).HasMaxLength(InvoiceConst.TRANSACTION_ID_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(InvoiceConst.FIELD_STATUS);
            builder.Property(x => x.Note).HasColumnName(InvoiceConst.FIELD_NOTE).HasMaxLength(InvoiceConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.IssuedAt).HasColumnName(InvoiceConst.FIELD_ISSUED_AT);
            builder.Property(x => x.CreatedAt).HasColumnName(InvoiceConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(InvoiceConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(InvoiceConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(InvoiceConst.FIELD_UPDATED_BY);

            builder.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).IsRequired(false);
            builder.HasOne(x => x.Salon).WithMany().HasForeignKey(x => x.SalonId).IsRequired(false);

            builder.ToTable(InvoiceConst.TABLE_NAME);
        }
    }
}
