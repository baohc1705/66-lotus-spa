using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class WalletConfiguration : IEntityTypeConfiguration<Wallet>
    {
        public void Configure(EntityTypeBuilder<Wallet> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(WalletConst.FIELD_ID);
            builder.Property(x => x.CustomerId).HasColumnName(WalletConst.FIELD_CUSTOMER_ID);
            builder.Property(x => x.Balance).HasColumnName(WalletConst.FIELD_BALANCE).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.Status).HasColumnName(WalletConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(WalletConst.FIELD_CREATED_AT);

            builder.HasOne(x => x.Customer).WithOne(c => c.Wallet).HasForeignKey<Wallet>(x => x.CustomerId).IsRequired(false);

            builder.ToTable(WalletConst.TABLE_NAME);
        }
    }
}
