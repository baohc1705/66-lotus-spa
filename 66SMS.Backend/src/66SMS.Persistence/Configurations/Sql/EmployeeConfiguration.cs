using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
    {
        public void Configure(EntityTypeBuilder<Employee> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(EmployeeConst.FIELD_ID);
            builder.Property(x => x.UserId).HasColumnName(EmployeeConst.FIELD_USER_ID);
            builder.Property(x => x.Code).HasColumnName(EmployeeConst.FIELD_CODE).HasMaxLength(EmployeeConst.CODE_MAX_LENGTH);
            builder.Property(x => x.FullName).HasColumnName(EmployeeConst.FIELD_FULLNAME).HasMaxLength(EmployeeConst.FULLNAME_MAX_LENGTH);
            builder.Property(x => x.Image).HasColumnName(EmployeeConst.FIELD_AVATAR_URL).HasMaxLength(EmployeeConst.AVATAR_MAX_LENGTH);
            builder.Property(x => x.Dob).HasColumnName(EmployeeConst.FIELD_DOB);
            builder.Property(x => x.Gender).HasColumnName(EmployeeConst.FIELD_GENDER).HasConversion<int>();
            builder.Property(x => x.NationalId).HasColumnName(EmployeeConst.FIELD_NATIONAL_ID).HasMaxLength(EmployeeConst.NATIONAL_ID_MAX_LENGTH);
            builder.Property(x => x.Phone).HasColumnName(EmployeeConst.FIELD_PHONE).HasMaxLength(EmployeeConst.PHONE_MAX_LENGTH);
            builder.Property(x => x.HireDate).HasColumnName(EmployeeConst.FIELD_HIRE_DATE);
            builder.Property(x => x.ContractType).HasColumnName(EmployeeConst.FIELD_CONTRACT_TYPE).HasMaxLength(EmployeeConst.CONTRACT_TYPE_MAX_LENGTH);
            builder.Property(x => x.BasicSalary).HasColumnName(EmployeeConst.FIELD_BASIC_SALARY);
            builder.Property(x => x.Status).HasColumnName(EmployeeConst.FIELD_STATUS).HasConversion<int>();
            builder.Property(x => x.StreetAddress).HasColumnName(EmployeeConst.FIELD_STREET_ADDRESS).HasMaxLength(EmployeeConst.STREET_MAX_LENGTH);
            builder.Property(x => x.ProvinceCode).HasColumnName(EmployeeConst.FIELD_PROVINCE_CODE).HasMaxLength(EmployeeConst.PROVINCE_MAX_LENGTH);
            builder.Property(x => x.WardCode).HasColumnName(EmployeeConst.FIELD_WARD_CODE).HasMaxLength(EmployeeConst.WARD_MAX_LENGTH);
            builder.Property(x => x.FullAddress).HasColumnName(EmployeeConst.FIELD_FULL_ADDRESS).HasMaxLength(EmployeeConst.FULL_ADDRESS_MAX_LENGTH);
            builder.Property(x => x.CreatedAt).HasColumnName(EmployeeConst.FIELD_CREATED_AT);
            builder.Property(x => x.ModifiedAt).HasColumnName(EmployeeConst.FIELD_MODIFIED_AT);
            builder.Property(x => x.IsDeleted).HasColumnName(EmployeeConst.FIELD_IS_DELETED);

            builder.HasOne(x => x.User).WithOne(x => x.Employee).HasForeignKey<Employee>(x => x.UserId).IsRequired(false);
            builder.ToTable(EmployeeConst.TABLE_NAME);
        }
    }
}
