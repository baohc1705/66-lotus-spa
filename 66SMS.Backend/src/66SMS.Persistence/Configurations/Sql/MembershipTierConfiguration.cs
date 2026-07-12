using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class MembershipTierConfiguration : IEntityTypeConfiguration<MembershipTier>
    {
        public void Configure(EntityTypeBuilder<MembershipTier> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(MembershipTierConst.FIELD_ID);
            builder.Property(x => x.Name).HasColumnName(MembershipTierConst.FIELD_NAME).HasMaxLength(MembershipTierConst.NAME_MAX_LENGTH);
            builder.Property(x => x.MinSpending).HasColumnName(MembershipTierConst.FIELD_MIN_SPENDING).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.DiscountPercent).HasColumnName(MembershipTierConst.FIELD_DISCOUNT_PERCENT);
            builder.Property(x => x.PointMultiplier).HasColumnName(MembershipTierConst.FIELD_POINT_MULTIPLIER).HasColumnType("decimal(5, 2)");
            builder.Property(x => x.Benefits).HasColumnName(MembershipTierConst.FIELD_BENEFITS).HasMaxLength(MembershipTierConst.BENEFITS_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(MembershipTierConst.FIELD_STATUS);
            builder.ToTable(MembershipTierConst.TABLE_NAME);
           
        }
    }
}
