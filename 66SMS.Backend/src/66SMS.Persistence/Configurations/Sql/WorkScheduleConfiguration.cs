using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class WorkScheduleConfiguration : IEntityTypeConfiguration<WorkSchedule>
    {

        public void Configure(EntityTypeBuilder<WorkSchedule> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(WorkScheduleConst.FIELD_ID);
            builder.Property(x => x.ShiftPeriodId).HasColumnName(WorkScheduleConst.FIELD_SHIFT_PERIOD_ID);
            builder.Property(x => x.EmployeeId).HasColumnName(WorkScheduleConst.FIELD_EMPLOYEE_ID);
            builder.Property(x => x.WorkDate).HasColumnName(WorkScheduleConst.FIELD_WORK_DATE);
            builder.HasOne(x => x.ShiftPeriod).WithMany(x => x.WorkSchedules).HasForeignKey(x => x.ShiftPeriodId).IsRequired();
            builder.HasOne(x => x.Employee).WithMany().HasForeignKey(x => x.EmployeeId).IsRequired();
            builder.ToTable(WorkScheduleConst.TABLE_NAME);
        }
    }
}
