using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class MembershipCardHistoryConfiguration : IEntityTypeConfiguration<MembershipCardHistory>
    {
        public void Configure(EntityTypeBuilder<MembershipCardHistory> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(MembershipCardHistoryConst.FIELD_ID);
            builder.Property(x => x.MembershipCardId).HasColumnName(MembershipCardHistoryConst.FIELD_MEMBERSHIP_CARD_ID);
            builder.Property(x => x.OldTierId).HasColumnName(MembershipCardHistoryConst.FIELD_OLD_TIER_ID);
            builder.Property(x => x.NewTierId).HasColumnName(MembershipCardHistoryConst.FIELD_NEW_TIER_ID);
            builder.Property(x => x.Reason).HasColumnName(MembershipCardHistoryConst.FIELD_REASON).HasMaxLength(MembershipCardHistoryConst.REASON_MAX_LENGTH);
            builder.Property(x => x.ChangedBy).HasColumnName(MembershipCardHistoryConst.FIELD_CHANGED_BY);
            builder.Property(x => x.CreatedAt).HasColumnName(MembershipCardHistoryConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(MembershipCardHistoryConst.FIELD_CREATED_BY);

            builder.HasOne(x => x.Card).WithMany(x => x.Histories).HasForeignKey(x => x.MembershipCardId).IsRequired(false);
            builder.HasOne(x => x.OldTier).WithMany().HasForeignKey(x => x.OldTierId).IsRequired(false);
            builder.HasOne(x => x.NewTier).WithMany().HasForeignKey(x => x.NewTierId).IsRequired(false);
            builder.HasOne(x => x.ChangedByUser).WithMany().HasForeignKey(x => x.ChangedBy).IsRequired(false);

            builder.ToTable(MembershipCardHistoryConst.TABLE_NAME);
        }
    }
}
