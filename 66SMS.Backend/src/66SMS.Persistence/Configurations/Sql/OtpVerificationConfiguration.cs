using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class OtpVerificationConfiguration : IEntityTypeConfiguration<OtpVerification>
    {
        public void Configure(EntityTypeBuilder<OtpVerification> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.UserId).HasColumnName(OtpVerificationConst.FIELD_USER_ID);
            builder.Property(x => x.OtpCode).HasColumnName(OtpVerificationConst.FIELD_OTP_CODE).HasMaxLength(OtpVerificationConst.OTP_CODE_MAX_LENGTH);
            builder.Property(x => x.ExpiresAt).HasColumnName(OtpVerificationConst.FIELD_EXPIRES_AT);
            builder.Property(x => x.IsUsed).HasColumnName(OtpVerificationConst.FIELD_IS_USED);
            builder.Property(x => x.CreatedAt).HasColumnName(OtpVerificationConst.FIELD_CREATED_AT);

            builder.ToTable(OtpVerificationConst.TABLE_NAME);

            builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
        }
    }
}
