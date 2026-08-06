using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class ServiceConfiguration : IEntityTypeConfiguration<Service>
    {
        public void Configure(EntityTypeBuilder<Service> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(ServiceConst.FIELD_ID);
            builder.Property(x => x.CategoryId).HasColumnName(ServiceConst.FIELD_CATEGORY_ID);
            builder.Property(x => x.Code).HasColumnName(ServiceConst.FIELD_CODE).HasMaxLength(ServiceConst.CODE_MAX_LENGTH);
            builder.Property(x => x.Name).HasColumnName(ServiceConst.FIELD_NAME).HasMaxLength(ServiceConst.NAME_MAX_LENGTH);
            builder.Property(x => x.Description).HasColumnName(ServiceConst.FIELD_DESCRIPTION).HasMaxLength(ServiceConst.DESCRIPTION_MAX_LENGTH);
            builder.Property(x => x.Content).HasColumnName(ServiceConst.FIELD_CONTENT);
            builder.Property(x => x.DurationMins).HasColumnName(ServiceConst.FIELD_DURATION_MINS);
            builder.Property(x => x.CostPrice).HasColumnName(ServiceConst.FIELD_COST_PRICE).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.SellingPrice).HasColumnName(ServiceConst.FIELD_SELLING_PRICE).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.MinSellingPrice).HasColumnName(ServiceConst.FIELD_MIN_SELLING_PRICE).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.CommissionRate).HasColumnName(ServiceConst.FIELD_COMMISSION_RATE).HasColumnType("decimal(5, 0)");
            builder.Property(x => x.SortOrder).HasColumnName(ServiceConst.FIELD_SORT_ORDER);
            builder.Property(x => x.Status).HasColumnName(ServiceConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(ServiceConst.FIELD_CREATED_AT);
            builder.Property(x => x.ImageUrl).HasColumnName(ServiceConst.FIELD_IMAGE_URL).HasMaxLength(ServiceConst.IMAGE_URL_MAX_LENGTH);
            builder.Property(x => x.UpdatedAt).HasColumnName(ServiceConst.FIELD_UPDATED_AT);
            builder.HasOne(x => x.Category).WithMany(c => c.Services).HasForeignKey(x => x.CategoryId).IsRequired(false);
            builder.ToTable(ServiceConst.TABLE_NAME);
        }
    }
}
