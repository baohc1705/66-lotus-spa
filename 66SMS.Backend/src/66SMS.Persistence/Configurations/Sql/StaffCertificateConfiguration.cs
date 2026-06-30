using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class StaffCertificateConfiguration : IEntityTypeConfiguration<StaffCertificate>
    {
        public void Configure(EntityTypeBuilder<StaffCertificate> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(StaffCertificateConst.FIELD_ID);
            builder.Property(x => x.StaffId).HasColumnName(StaffCertificateConst.FIELD_STAFF_ID);
            builder.Property(x => x.CertificateTypeId).HasColumnName(StaffCertificateConst.FIELD_CERTIFICATE_TYPE_ID);
            builder.Property(x => x.CertificateName).HasColumnName(StaffCertificateConst.FIELD_CERTIFICATE_NAME).HasMaxLength(StaffCertificateConst.CERTIFICATE_NAME_MAX_LENGTH);
            builder.Property(x => x.CertificateNumber).HasColumnName(StaffCertificateConst.FIELD_CERTIFICATE_NUMBER).HasMaxLength(StaffCertificateConst.CERTIFICATE_NUMBER_MAX_LENGTH);
            builder.Property(x => x.IssuingOrganization).HasColumnName(StaffCertificateConst.FIELD_ISSUING_ORGANIZATION).HasMaxLength(StaffCertificateConst.ISSUING_ORGANIZATION_MAX_LENGTH);
            builder.Property(x => x.IssuedDate).HasColumnName(StaffCertificateConst.FIELD_ISSUED_DATE);
            builder.Property(x => x.ExpiryDate).HasColumnName(StaffCertificateConst.FIELD_EXPIRY_DATE);
            builder.Property(x => x.DocumentUrl).HasColumnName(StaffCertificateConst.FIELD_DOCUMENT_URL).HasMaxLength(StaffCertificateConst.DOCUMENT_URL_MAX_LENGTH);
            builder.Property(x => x.Note).HasColumnName(StaffCertificateConst.FIELD_NOTE).HasMaxLength(StaffCertificateConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(StaffCertificateConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(StaffCertificateConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(StaffCertificateConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(StaffCertificateConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(StaffCertificateConst.FIELD_UPDATED_BY);

            builder.HasOne(x => x.Staff).WithMany().HasForeignKey(x => x.StaffId).IsRequired();
            builder.HasOne(x => x.CertificateType).WithMany(c => c.StaffCertificates).HasForeignKey(x => x.CertificateTypeId).IsRequired();

            builder.ToTable(StaffCertificateConst.TABLE_NAME);
        }
    }
}
