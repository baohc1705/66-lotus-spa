using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class ServiceCategoryConfiguration : IEntityTypeConfiguration<ServiceCategory>
    {
        public void Configure(EntityTypeBuilder<ServiceCategory> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(ServiceCategoryConst.FIELD_ID);
            builder.Property(x => x.Name).HasColumnName(ServiceCategoryConst.FIELD_NAME).HasMaxLength(ServiceCategoryConst.NAME_MAX_LENGTH);
            builder.Property(x => x.Description).HasColumnName(ServiceCategoryConst.FIELD_DESCRIPTION).HasMaxLength(ServiceCategoryConst.DESCRIPTION_MAX_LENGTH);
            builder.Property(x => x.SortOrder).HasColumnName(ServiceCategoryConst.FIELD_SORT_ORDER);
            builder.Property(x => x.Status).HasColumnName(ServiceCategoryConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(ServiceCategoryConst.FIELD_CREATED_AT);
            builder.Property(x => x.UpdatedAt).HasColumnName(ServiceCategoryConst.FIELD_UPDATED_AT);
            builder.ToTable(ServiceCategoryConst.TABLE_NAME);
        }
    }
}
