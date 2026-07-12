using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
    {

        public void Configure(EntityTypeBuilder<Customer> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(CustomerConst.FIELD_ID);
            builder.Property(x => x.UserId).HasColumnName(CustomerConst.FIELD_USER_ID);
            builder.Property(x => x.FullName).HasColumnName(CustomerConst.FIELD_FULL_NAME).HasMaxLength(CustomerConst.FULL_NAME_MAX_LENGTH);
            builder.Property(x => x.AvatarUrl).HasColumnName(CustomerConst.FIELD_AVATAR_URL).HasMaxLength(CustomerConst.AVATAR_URL_MAX_LENGTH);
            builder.Property(x => x.DateOfBirth).HasColumnName(CustomerConst.FIELD_DATE_OF_BIRTH);
            builder.Property(x => x.Gender).HasColumnName(CustomerConst.FIELD_GENDER).HasConversion<int>();
            builder.Property(x => x.Phone).HasColumnName(CustomerConst.FIELD_PHONE).HasMaxLength(CustomerConst.PHONE_MAX_LENGTH);
            builder.Property(x => x.LoyaltyPoint).HasColumnName(CustomerConst.FIELD_LOYALTY_POINT);
            builder.Property(x => x.FirstPurchaseAt).HasColumnName(CustomerConst.FIELD_FIRST_PURCHASE_AT);
            builder.Property(x => x.LastPurchaseAt).HasColumnName(CustomerConst.FIELD_LAST_PURCHASE_AT);
            builder.Property(x => x.Source).HasColumnName(CustomerConst.FIELD_SOURCE).HasMaxLength(CustomerConst.SOURCE_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(CustomerConst.FIELD_STATUS).HasConversion<int>();
            builder.Property(x => x.Note).HasColumnName(CustomerConst.FIELD_NOTE).HasMaxLength(CustomerConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.StreetAddress).HasColumnName(CustomerConst.FIELD_STREET_ADDRESS).HasMaxLength(CustomerConst.STREET_ADDRESS_MAX_LENGTH);
            builder.Property(x => x.ProvinceCode).HasColumnName(CustomerConst.FIELD_PROVINCE_CODE).HasMaxLength(CustomerConst.PROVINCE_CODE_MAX_LENGTH);
            builder.Property(x => x.WardCode).HasColumnName(CustomerConst.FIELD_WARD_CODE).HasMaxLength(CustomerConst.WARD_CODE_MAX_LENGTH);
            builder.Property(x => x.FullAddress).HasColumnName(CustomerConst.FIELD_FULL_ADDRESS).HasMaxLength(CustomerConst.FULL_ADDRESS_MAX_LENGTH);
            builder.Property(x => x.CreatedAt).HasColumnName(CustomerConst.FIELD_CREATED_AT);
            builder.Property(x => x.UpdatedAt).HasColumnName(CustomerConst.FIELD_UPDATED_AT);
            builder.HasOne(x => x.User).WithOne(x => x.Customer).HasForeignKey<Customer>(x => x.UserId).IsRequired(false);
            builder.ToTable(CustomerConst.TABLE_NAME);
        }
    }
}
