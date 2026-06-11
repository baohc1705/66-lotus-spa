using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
    {
        public void Configure(EntityTypeBuilder<ProductImage> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(ProductImageConst.FIELD_ID);
            builder.Property(x => x.ProductId).HasColumnName(ProductImageConst.FIELD_PRODUCT_ID);
            builder.Property(x => x.Url).HasColumnName(ProductImageConst.FIELD_URL).HasMaxLength(ProductImageConst.URL_MAX_LENGTH);
            builder.Property(x => x.SortOrder).HasColumnName(ProductImageConst.FIELD_SORT_ORDER);
            builder.Property(x => x.IsPrimary).HasColumnName(ProductImageConst.FIELD_IS_PRIMARY);

            builder.HasOne(x => x.Product).WithMany(p => p.Images).HasForeignKey(x => x.ProductId).IsRequired(false);

            builder.ToTable(ProductImageConst.TABLE_NAME);
        }
    }
}
