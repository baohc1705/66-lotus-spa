using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
    {
        public void Configure(EntityTypeBuilder<RolePermission> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.RoleId).HasColumnName(RolePermissionConst.FIELD_ROLE_ID);
            builder.Property(x => x.PermissionId).HasColumnName(RolePermissionConst.FIELD_PERMISSION_ID);
            builder.Property(x => x.AssignedAt).HasColumnName(RolePermissionConst.FIELD_ASSIGNED_AT);
            builder.Property(x => x.CreatedAt).HasColumnName(RolePermissionConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(RolePermissionConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(RolePermissionConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(RolePermissionConst.FIELD_UPDATED_BY);

            builder.ToTable(RolePermissionConst.TABLE_NAME);

            builder.HasOne(x => x.Role).WithMany(r => r.RolePermissions).HasForeignKey(x => x.RoleId).IsRequired(false);
            builder.HasOne(x => x.Permission).WithMany(p => p.RolePermissions).HasForeignKey(x => x.PermissionId).IsRequired(false);
        }
    }
}
