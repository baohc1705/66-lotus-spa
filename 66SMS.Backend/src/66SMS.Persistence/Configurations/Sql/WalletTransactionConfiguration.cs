using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class WalletTransactionConfiguration : IEntityTypeConfiguration<WalletTransaction>
    {
        public void Configure(EntityTypeBuilder<WalletTransaction> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(WalletTransactionConst.FIELD_ID);
            builder.Property(x => x.WalletId).HasColumnName(WalletTransactionConst.FIELD_WALLET_ID);
            builder.Property(x => x.AppointmentPaymentId).HasColumnName(WalletTransactionConst.FIELD_APPOINTMENT_PAYMENT_ID);
            builder.Property(x => x.Amount).HasColumnName(WalletTransactionConst.FIELD_AMOUNT).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.BalanceAfter).HasColumnName(WalletTransactionConst.FIELD_BALANCE_AFTER).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.Type).HasColumnName(WalletTransactionConst.FIELD_TYPE);
            builder.Property(x => x.Note).HasColumnName(WalletTransactionConst.FIELD_NOTE).HasMaxLength(WalletTransactionConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(WalletTransactionConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(WalletTransactionConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(WalletTransactionConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(WalletTransactionConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(WalletTransactionConst.FIELD_UPDATED_BY);

            builder.HasOne(x => x.Wallet).WithMany(x => x.Transactions).HasForeignKey(x => x.WalletId).IsRequired(false);
            builder.HasOne(x => x.AppointmentPayment).WithMany(x => x.WalletTransactions).HasForeignKey(x => x.AppointmentPaymentId).IsRequired(false);

            builder.ToTable(WalletTransactionConst.TABLE_NAME);
        }
    }
}
