using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
    {
        public void Configure(EntityTypeBuilder<UserRole> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.UserId).HasColumnName(UserRoleConst.FIELD_USER_ID);
            builder.Property(x => x.RoleId).HasColumnName(UserRoleConst.FIELD_ROLE_ID);
            builder.Property(x => x.AssignedAt).HasColumnName(UserRoleConst.FIELD_ASSIGNED_AT);
            builder.Property(x => x.AssignedBy).HasColumnName(UserRoleConst.FIELD_ASSIGNED_BY);

            builder.ToTable(UserRoleConst.TABLE_NAME);

            builder.HasOne(x => x.User).WithMany(u => u.UserRoles).HasForeignKey(x => x.UserId);
            builder.HasOne(x => x.Role).WithMany(r => r.UserRoles).HasForeignKey(x => x.RoleId);
        }
    }
}
