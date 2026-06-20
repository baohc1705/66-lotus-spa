using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Username).HasColumnName(UserConst.FIELD_USERNAME);
            builder.Property(x => x.Email).HasColumnName(UserConst.FIELD_EMAIL);
            builder.Property(x => x.PasswordHash).HasColumnName(UserConst.FIELD_PASSWORD_HASH);
            builder.Property(x => x.IsEmailConfirmed).HasColumnName(UserConst.FIELD_IS_EMAIL_CONFIRMED);
            builder.Property(x => x.AccessFailedCount).HasColumnName(UserConst.FIELD_ACCESS_FAILED_COUNT);
            builder.Property(x => x.Status).HasColumnName(UserConst.FIELD_STATUS);
            builder.Property(x => x.LockoutEnd).HasColumnName(UserConst.FIELD_LOCKOUT_END);
            builder.Property(x => x.LastLoginAt).HasColumnName(UserConst.FIELD_LAST_LOGIN_AT);
            builder.Property(x => x.CreatedAt).HasColumnName(UserConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(UserConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(UserConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(UserConst.FIELD_UPDATED_BY);
            builder.Property(x => x.PasswordResetToken).HasColumnName(UserConst.FIELD_PASSWORD_RESET_TOKEN);
            builder.Property(x => x.PasswordResetTokenExpiry).HasColumnName(UserConst.FIELD_PASSWORD_RESET_TOKEN_EXPIRY);
            builder.ToTable(UserConst.TABLE_NAME);
        }
    }
}
