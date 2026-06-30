using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class CertificateTypeConfiguration : IEntityTypeConfiguration<CertificateType>
    {
        public void Configure(EntityTypeBuilder<CertificateType> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(CertificateTypeConst.FIELD_ID);
            builder.Property(x => x.Code).HasColumnName(CertificateTypeConst.FIELD_CODE).HasMaxLength(CertificateTypeConst.CODE_MAX_LENGTH);
            builder.Property(x => x.Name).HasColumnName(CertificateTypeConst.FIELD_NAME).HasMaxLength(CertificateTypeConst.NAME_MAX_LENGTH);
            builder.Property(x => x.Description).HasColumnName(CertificateTypeConst.FIELD_DESCRIPTION).HasMaxLength(CertificateTypeConst.DESCRIPTION_MAX_LENGTH);
            builder.Property(x => x.SortOrder).HasColumnName(CertificateTypeConst.FIELD_SORT_ORDER);
            builder.Property(x => x.Status).HasColumnName(CertificateTypeConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(CertificateTypeConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(CertificateTypeConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(CertificateTypeConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(CertificateTypeConst.FIELD_UPDATED_BY);
            builder.ToTable(CertificateTypeConst.TABLE_NAME);
        }
    }
}
