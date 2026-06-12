using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).HasColumnName(RoleConst.FIELD_NAME).HasMaxLength(RoleConst.NAME_MAX_LENGTH);
            builder.Property(x => x.Description).HasColumnName(RoleConst.FIELD_DESCRIPTION).HasMaxLength(RoleConst.DESCRIPTION_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(RoleConst.FIELD_STATUS).HasConversion<int>();
            builder.Property(x => x.CreatedAt).HasColumnName(RoleConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(RoleConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(RoleConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(RoleConst.FIELD_UPDATED_BY);

            builder.ToTable(RoleConst.TABLE_NAME);
            builder.HasQueryFilter(x => x.Status != RoleConst.STATUS_DELETED);
        }
    }
}
