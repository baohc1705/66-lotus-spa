using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.UserId).HasColumnName(RefreshTokenConst.FIELD_USER_ID);
            builder.Property(x => x.Token).HasColumnName(RefreshTokenConst.FIELD_TOKEN).HasMaxLength(RefreshTokenConst.TOKEN_MAX_LENGTH);
            builder.Property(x => x.ExpiresAt).HasColumnName(RefreshTokenConst.FIELD_EXPIRES_AT);
            builder.Property(x => x.IsRevoked).HasColumnName(RefreshTokenConst.FIELD_IS_REVOKED);
            builder.Property(x => x.CreatedByIp).HasColumnName(RefreshTokenConst.FIELD_CREATED_BY_IP).HasMaxLength(RefreshTokenConst.CREATED_BY_IP_MAX_LENGTH);
            builder.Property(x => x.RevokedByIp).HasColumnName(RefreshTokenConst.FIELD_REVOKED_BY_IP).HasMaxLength(RefreshTokenConst.REVOKED_BY_IP_MAX_LENGTH);
            builder.Property(x => x.RevokedAt).HasColumnName(RefreshTokenConst.FIELD_REVOKED_AT);
            builder.Property(x => x.CreatedAt).HasColumnName(RefreshTokenConst.FIELD_CREATED_AT);
            builder.Property(x => x.UpdatedAt).HasColumnName(RefreshTokenConst.FIELD_UPDATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(RefreshTokenConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedBy).HasColumnName(RefreshTokenConst.FIELD_UPDATED_BY);

            builder.ToTable(RefreshTokenConst.TABLE_NAME);

            builder.HasOne(x => x.User).WithMany(x => x.RefreshTokens).HasForeignKey(x => x.UserId).IsRequired(false);
        }
    }
}
