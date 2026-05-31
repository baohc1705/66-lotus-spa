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
            builder.Property(x => x.FullAddreess).HasColumnName(CustomerConst.FIELD_FULLNAME).HasMaxLength(CustomerConst.FULLNAME_MAX_LENGTH);
            builder.Property(x => x.Image).HasColumnName(CustomerConst.FIELD_AVATAR_URL).HasMaxLength(CustomerConst.AVATAR_MAX_LENGTH);
            builder.Property(x => x.Dob).HasColumnName(CustomerConst.FIELD_DOB);
            builder.Property(x => x.Gender).HasColumnName(CustomerConst.FIELD_GENDER).HasConversion<int>();
            builder.Property(x => x.Phone).HasColumnName(CustomerConst.FIELD_PHONE).HasMaxLength(CustomerConst.PHONE_MAX_LENGTH);
            builder.Property(x => x.Tier).HasColumnName(CustomerConst.FIELD_TIER).HasMaxLength(CustomerConst.TIER_MAX_LENGTH);
            builder.Property(x => x.LoyaltyPoint).HasColumnName(CustomerConst.FIELD_LOYALTY_POINT);
            builder.Property(x => x.FirstPurchaseAt).HasColumnName(CustomerConst.FIELD_FIRST_PURCHASE_AT);
            builder.Property(x => x.LastPurchaseAt).HasColumnName(CustomerConst.FIELD_LAST_PURCHASE_AT);
            builder.Property(x => x.Source).HasColumnName(CustomerConst.FIELD_SOURCE).HasMaxLength(CustomerConst.SOURCE_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(CustomerConst.FIELD_STATUS).HasConversion<int>();
            builder.Property(x => x.Note).HasColumnName(CustomerConst.FIELD_NOTE).HasMaxLength(CustomerConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.StreetAddress).HasColumnName(CustomerConst.FIELD_STREET_ADDRESS).HasMaxLength(CustomerConst.STREET_MAX_LENGTH);
            builder.Property(x => x.ProvinceCode).HasColumnName(CustomerConst.FIELD_PROVINCE_CODE);
            builder.Property(x => x.WardCode).HasColumnName(CustomerConst.FIELD_WARD_CODE);
            builder.Property(x => x.FullAddreess).HasColumnName(CustomerConst.FIELD_FULL_ADDRESS);
            builder.Property(x => x.CreatedAt).HasColumnName(CustomerConst.FIELD_CREATED_AT);
            builder.Property(x => x.ModifiedAt).HasColumnName(CustomerConst.FIELD_MODIFIED_AT);
            builder.Property(x => x.IsDeleted).HasColumnName(CustomerConst.FIELD_IS_DELETED);
            builder.HasOne(x => x.User).WithOne(x => x.Customer).HasForeignKey<Customer>(x => x.UserId).IsRequired(false);
            builder.ToTable(CustomerConst.TABLE_NAME);
        }
    }
}
