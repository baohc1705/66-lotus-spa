using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class MembershipCardConfiguration : IEntityTypeConfiguration<MembershipCard>
    {
        public void Configure(EntityTypeBuilder<MembershipCard> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(MembershipCardConst.FIELD_ID);
            builder.Property(x => x.CustomerId).HasColumnName(MembershipCardConst.FIELD_CUSTOMER_ID);
            builder.Property(x => x.MembershipTierId).HasColumnName(MembershipCardConst.FIELD_MEMBERSHIP_TIER_ID);
            builder.Property(x => x.CardCode).HasColumnName(MembershipCardConst.FIELD_CARD_CODE).HasMaxLength(MembershipCardConst.CARD_CODE_MAX_LENGTH);
            builder.Property(x => x.IssuedAt).HasColumnName(MembershipCardConst.FIELD_ISSUED_AT);
            builder.Property(x => x.ExpiresAt).HasColumnName(MembershipCardConst.FIELD_EXPIRES_AT);
            builder.Property(x => x.Status).HasColumnName(MembershipCardConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(MembershipCardConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(MembershipCardConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(MembershipCardConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(MembershipCardConst.FIELD_UPDATED_BY);

            builder.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).IsRequired(false);
            builder.HasOne(x => x.Tier).WithMany(x => x.Cards).HasForeignKey(x => x.MembershipTierId).IsRequired(false);

            builder.ToTable(MembershipCardConst.TABLE_NAME);
        }
    }
}
