using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class PromotionConfiguration : IEntityTypeConfiguration<Promotion>
    {
        public void Configure(EntityTypeBuilder<Promotion> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(PromotionConst.FIELD_ID);
            builder.Property(x => x.Code).HasColumnName(PromotionConst.FIELD_CODE).HasMaxLength(PromotionConst.CODE_MAX_LENGTH).IsRequired();
            builder.Property(x => x.Name).HasColumnName(PromotionConst.FIELD_NAME).HasMaxLength(PromotionConst.NAME_MAX_LENGTH).IsRequired();
            builder.Property(x => x.Description).HasColumnName(PromotionConst.FIELD_DESCRIPTION).HasMaxLength(PromotionConst.DESCRIPTION_MAX_LENGTH);
            builder.Property(x => x.DiscountType).HasColumnName(PromotionConst.FIELD_DISCOUNT_TYPE);
            builder.Property(x => x.DiscountValue).HasColumnName(PromotionConst.FIELD_DISCOUNT_VALUE).HasColumnType("decimal(18,2)");
            builder.Property(x => x.MaxDiscountAmount).HasColumnName(PromotionConst.FIELD_MAX_DISCOUNT_AMOUNT).HasColumnType("decimal(18,2)");
            builder.Property(x => x.MinOrderValue).HasColumnName(PromotionConst.FIELD_MIN_ORDER_VALUE).HasColumnType("decimal(18,2)");
            builder.Property(x => x.BuyQuantity).HasColumnName(PromotionConst.FIELD_BUY_QUANTITY);
            builder.Property(x => x.GetQuantity).HasColumnName(PromotionConst.FIELD_GET_QUANTITY);
            builder.Property(x => x.UsageLimit).HasColumnName(PromotionConst.FIELD_USAGE_LIMIT);
            builder.Property(x => x.UsedCount).HasColumnName(PromotionConst.FIELD_USED_COUNT);
            builder.Property(x => x.StartDate).HasColumnName(PromotionConst.FIELD_START_DATE);
            builder.Property(x => x.EndDate).HasColumnName(PromotionConst.FIELD_END_DATE);
            builder.Property(x => x.Status).HasColumnName(PromotionConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(PromotionConst.FIELD_CREATED_AT);

            builder.HasIndex(x => x.Code).IsUnique();
            builder.ToTable(PromotionConst.TABLE_NAME);
        }
    }
}
