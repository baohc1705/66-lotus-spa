using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class ServiceProductConfiguration : IEntityTypeConfiguration<ServiceProduct>
    {
        public void Configure(EntityTypeBuilder<ServiceProduct> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(ServiceProductConst.FIELD_ID);
            builder.Property(x => x.ServiceId).HasColumnName(ServiceProductConst.FIELD_SERVICE_ID);
            builder.Property(x => x.ProductId).HasColumnName(ServiceProductConst.FIELD_PRODUCT_ID);
            builder.Property(x => x.QuantityUsed).HasColumnName(ServiceProductConst.FIELD_QUANTITY_USED);
            builder.Property(x => x.Note).HasColumnName(ServiceProductConst.FIELD_NOTE).HasMaxLength(ServiceProductConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(ServiceProductConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(ServiceProductConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(ServiceProductConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(ServiceProductConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(ServiceProductConst.FIELD_UPDATED_BY);
            builder.HasOne(x => x.Service).WithMany(s => s.ServiceProducts).HasForeignKey(x => x.ServiceId).IsRequired(false);
            builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).IsRequired(false);
            builder.ToTable(ServiceProductConst.TABLE_NAME);
            builder.HasQueryFilter(x => x.Status != ServiceProductConst.STATUS_DELETED);
        }
    }
}
