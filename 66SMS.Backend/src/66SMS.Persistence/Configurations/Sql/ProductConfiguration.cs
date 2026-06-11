using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class ProductConfiguration : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(ProductConst.FIELD_ID);
            builder.Property(x => x.CategoryId).HasColumnName(ProductConst.FIELD_CATEGORY_ID);
            builder.Property(x => x.Code).HasColumnName(ProductConst.FIELD_CODE).HasMaxLength(ProductConst.CODE_MAX_LENGTH);
            builder.Property(x => x.Name).HasColumnName(ProductConst.FIELD_NAME).HasMaxLength(ProductConst.NAME_MAX_LENGTH);
            builder.Property(x => x.Description).HasColumnName(ProductConst.FIELD_DESCRIPTION).HasMaxLength(ProductConst.DESCRIPTION_MAX_LENGTH);
            builder.Property(x => x.Content).HasColumnName(ProductConst.FIELD_CONTENT);
            builder.Property(x => x.Unit).HasColumnName(ProductConst.FIELD_UNIT).HasMaxLength(ProductConst.UNIT_MAX_LENGTH);
            builder.Property(x => x.CostPrice).HasColumnName(ProductConst.FIELD_COST_PRICE).HasColumnType("DECIMAL(18,0)");
            builder.Property(x => x.SellingPrice).HasColumnName(ProductConst.FIELD_SELLING_PRICE).HasColumnType("DECIMAL(18,0)");
            builder.Property(x => x.StockQuantity).HasColumnName(ProductConst.FIELD_STOCK_QUANTITY);
            builder.Property(x => x.MinStock).HasColumnName(ProductConst.FIELD_MIN_STOCK);
            builder.Property(x => x.Status).HasColumnName(ProductConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(ProductConst.FIELD_CREATED_AT);
            builder.Property(x => x.UpdatedAt).HasColumnName(ProductConst.FIELD_UPDATED_AT);

            builder.HasOne(x => x.Category).WithMany(c => c.Products).HasForeignKey(x => x.CategoryId).IsRequired(false);
            builder.ToTable(ProductConst.TABLE_NAME);
        }
    }
}
