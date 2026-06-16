using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class StaffConfiguration : IEntityTypeConfiguration<Staff>
    {
        public void Configure(EntityTypeBuilder<Staff> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(StaffConst.FIELD_ID);
            builder.Property(x => x.UserId).HasColumnName(StaffConst.FIELD_USER_ID);
            builder.Property(x => x.Code).HasColumnName(StaffConst.FIELD_CODE).HasMaxLength(StaffConst.CODE_MAX_LENGTH);
            builder.Property(x => x.FullName).HasColumnName(StaffConst.FIELD_FULL_NAME).HasMaxLength(StaffConst.FULL_NAME_MAX_LENGTH);
            builder.Property(x => x.AvatarUrl).HasColumnName(StaffConst.FIELD_AVATAR_URL).HasMaxLength(StaffConst.AVATAR_URL_MAX_LENGTH);
            builder.Property(x => x.DateOfBirth).HasColumnName(StaffConst.FIELD_DATE_OF_BIRTH);
            builder.Property(x => x.Gender).HasColumnName(StaffConst.FIELD_GENDER).HasConversion<int>();
            builder.Property(x => x.NationalId).HasColumnName(StaffConst.FIELD_NATIONAL_ID).HasMaxLength(StaffConst.NATIONAL_ID_MAX_LENGTH);
            builder.Property(x => x.Phone).HasColumnName(StaffConst.FIELD_PHONE).HasMaxLength(StaffConst.PHONE_MAX_LENGTH);
            builder.Property(x => x.HireDate).HasColumnName(StaffConst.FIELD_HIRE_DATE);
            builder.Property(x => x.ContractType).HasColumnName(StaffConst.FIELD_CONTRACT_TYPE).HasMaxLength(StaffConst.CONTRACT_TYPE_MAX_LENGTH);
            builder.Property(x => x.BasicSalary).HasColumnName(StaffConst.FIELD_BASIC_SALARY);
            builder.Property(x => x.Status).HasColumnName(StaffConst.FIELD_STATUS).HasConversion<int>();
            builder.Property(x => x.StreetAddress).HasColumnName(StaffConst.FIELD_STREET_ADDRESS).HasMaxLength(StaffConst.STREET_ADDRESS_MAX_LENGTH);
            builder.Property(x => x.ProvinceCode).HasColumnName(StaffConst.FIELD_PROVINCE_CODE).HasMaxLength(StaffConst.PROVINCE_CODE_MAX_LENGTH);
            builder.Property(x => x.WardCode).HasColumnName(StaffConst.FIELD_WARD_CODE).HasMaxLength(StaffConst.WARD_CODE_MAX_LENGTH);
            builder.Property(x => x.FullAddress).HasColumnName(StaffConst.FIELD_FULL_ADDRESS).HasMaxLength(StaffConst.FULL_ADDRESS_MAX_LENGTH);
            builder.Property(x => x.CreatedAt).HasColumnName(StaffConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(StaffConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(StaffConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(StaffConst.FIELD_UPDATED_BY);

            builder.Property(x => x.SalonId).HasColumnName(StaffConst.FIELD_SALON_ID);
            builder.HasOne(x => x.User).WithOne(x => x.Staff).HasForeignKey<Staff>(x => x.UserId).IsRequired(false);
            builder.HasOne(x => x.Salon).WithMany(b => b.Staffs).HasForeignKey(x => x.SalonId).IsRequired(false);
            builder.ToTable(StaffConst.TABLE_NAME);
            builder.HasQueryFilter(x => x.Status != StaffConst.STATUS_DELETED);
        }
    }
}
