using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class PayrollConfiguration : IEntityTypeConfiguration<Payroll>
    {
        public void Configure(EntityTypeBuilder<Payroll> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(PayrollConst.FIELD_ID);
            builder.Property(x => x.StaffId).HasColumnName(PayrollConst.FIELD_STAFF_ID);
            builder.Property(x => x.SalonId).HasColumnName(PayrollConst.FIELD_SALON_ID);
            builder.Property(x => x.PeriodMonth).HasColumnName(PayrollConst.FIELD_PERIOD_MONTH);
            builder.Property(x => x.PeriodYear).HasColumnName(PayrollConst.FIELD_PERIOD_YEAR);
            builder.Property(x => x.SalaryType).HasColumnName(PayrollConst.FIELD_SALARY_TYPE);
            builder.Property(x => x.Rate).HasColumnName(PayrollConst.FIELD_RATE).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.TotalHours).HasColumnName(PayrollConst.FIELD_TOTAL_HOURS).HasColumnType("decimal(7, 2)");
            builder.Property(x => x.TotalWorkDays).HasColumnName(PayrollConst.FIELD_TOTAL_WORK_DAYS).HasColumnType("decimal(5, 1)");
            builder.Property(x => x.TotalAmount).HasColumnName(PayrollConst.FIELD_TOTAL_AMOUNT).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.Status).HasColumnName(PayrollConst.FIELD_STATUS);
            builder.Property(x => x.Note).HasColumnName(PayrollConst.FIELD_NOTE).HasMaxLength(PayrollConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.CreatedAt).HasColumnName(PayrollConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(PayrollConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(PayrollConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(PayrollConst.FIELD_UPDATED_BY);

            builder.HasOne(x => x.Staff).WithMany().HasForeignKey(x => x.StaffId).IsRequired();
            builder.HasOne(x => x.Salon).WithMany().HasForeignKey(x => x.SalonId).IsRequired(false);

            builder.ToTable(PayrollConst.TABLE_NAME);
        }
    }
}
