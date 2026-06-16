using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class SalonConfiguration : IEntityTypeConfiguration<Salon>
    {
        public void Configure(EntityTypeBuilder<Salon> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(SalonConst.FIELD_ID);
            builder.Property(x => x.Code).HasColumnName(SalonConst.FIELD_CODE).HasMaxLength(SalonConst.CODE_MAX_LENGTH).IsRequired();
            builder.Property(x => x.Name).HasColumnName(SalonConst.FIELD_NAME).HasMaxLength(SalonConst.NAME_MAX_LENGTH).IsRequired();
            builder.Property(x => x.Phone).HasColumnName(SalonConst.FIELD_PHONE).HasMaxLength(SalonConst.PHONE_MAX_LENGTH).IsRequired();
            builder.Property(x => x.Email).HasColumnName(SalonConst.FIELD_EMAIL).HasMaxLength(SalonConst.EMAIL_MAX_LENGTH);
            builder.Property(x => x.StreetAddress).HasColumnName(SalonConst.FIELD_STREET_ADDRESS).HasMaxLength(SalonConst.STREET_ADDRESS_MAX_LENGTH);
            builder.Property(x => x.ProvinceCode).HasColumnName(SalonConst.FIELD_PROVINCE_CODE).HasMaxLength(SalonConst.PROVINCE_CODE_MAX_LENGTH);
            builder.Property(x => x.WardCode).HasColumnName(SalonConst.FIELD_WARD_CODE).HasMaxLength(SalonConst.WARD_CODE_MAX_LENGTH);
            builder.Property(x => x.FullAddress).HasColumnName(SalonConst.FIELD_FULL_ADDRESS).HasMaxLength(SalonConst.FULL_ADDRESS_MAX_LENGTH);
            builder.Property(x => x.Latitude).HasColumnName(SalonConst.FIELD_LATITUDE).HasPrecision(10, 8);
            builder.Property(x => x.Longitude).HasColumnName(SalonConst.FIELD_LONGITUDE).HasPrecision(11, 8);
            builder.Property(x => x.WorkingDays).HasColumnName(SalonConst.FIELD_WORKING_DAYS).HasMaxLength(SalonConst.WORKING_DAYS_MAX_LENGTH);
            builder.Property(x => x.TaxCode).HasColumnName(SalonConst.FIELD_TAX_CODE).HasMaxLength(SalonConst.TAX_CODE_MAX_LENGTH);
            builder.Property(x => x.ImageUrl).HasColumnName(SalonConst.FIELD_IMAGE_URL);
            builder.Property(x => x.Description).HasColumnName(SalonConst.FIELD_DESCRIPTION);
            builder.Property(x => x.SortOrder).HasColumnName(SalonConst.FIELD_SORT_ORDER);
            builder.Property(x => x.Status).HasColumnName(SalonConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(SalonConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(SalonConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(SalonConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(SalonConst.FIELD_UPDATED_BY);
            builder.ToTable(SalonConst.TABLE_NAME);
        }
    }
}
