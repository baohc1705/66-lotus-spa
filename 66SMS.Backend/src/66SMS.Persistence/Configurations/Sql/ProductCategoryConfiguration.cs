using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class ProductCategoryConfiguration : IEntityTypeConfiguration<ProductCategory>
    {
        public void Configure(EntityTypeBuilder<ProductCategory> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(ProductCategoryConst.FIELD_ID);
            builder.Property(x => x.Name).HasColumnName(ProductCategoryConst.FIELD_NAME).HasMaxLength(ProductCategoryConst.NAME_MAX_LENGTH);
            builder.Property(x => x.Description).HasColumnName(ProductCategoryConst.FIELD_DESCRIPTION).HasMaxLength(ProductCategoryConst.DESCRIPTION_MAX_LENGTH);
            builder.Property(x => x.SortOrder).HasColumnName(ProductCategoryConst.FIELD_SORT_ORDER);
            builder.Property(x => x.Status).HasColumnName(ProductCategoryConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(ProductCategoryConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(ProductCategoryConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(ProductCategoryConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(ProductCategoryConst.FIELD_UPDATED_BY);
            builder.ToTable(ProductCategoryConst.TABLE_NAME);
        }
    }
}
