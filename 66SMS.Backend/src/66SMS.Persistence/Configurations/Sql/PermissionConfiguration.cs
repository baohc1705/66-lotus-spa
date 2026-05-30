using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
    {
        public void Configure(EntityTypeBuilder<Permission> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(PermissionConst.FIELD_ID);
            builder.Property(x => x.Name).HasColumnName(PermissionConst.FIELD_NAME).HasMaxLength(PermissionConst.NAME_MAX_LENGTH);
            builder.Property(x => x.Resource).HasColumnName(PermissionConst.FIELD_RESOURCE).HasMaxLength(PermissionConst.RESOURCE_MAX_LENGTH);
            builder.Property(x => x.Action).HasColumnName(PermissionConst.FIELD_ACTION).HasMaxLength(PermissionConst.ACTION_MAX_LENGTH);
            builder.Property(x => x.Description).HasColumnName(PermissionConst.FIELD_DESCRIPTION).HasMaxLength(PermissionConst.DESCRIPTION_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(PermissionConst.FIELD_STATUS).HasConversion<int>();
            builder.Property(x => x.CreatedAt).HasColumnName(PermissionConst.FIELD_CREATED_AT);
            builder.Property(x => x.ModifiedAt).HasColumnName(PermissionConst.FIELD_MODIFIED_AT);
            builder.Property(x => x.IsDeleted).HasColumnName(PermissionConst.FIELD_IS_DELETED);

            builder.ToTable(PermissionConst.TABLE_NAME);
        }
    }
}
