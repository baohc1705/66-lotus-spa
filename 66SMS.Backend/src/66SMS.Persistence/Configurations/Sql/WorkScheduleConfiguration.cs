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
            builder.Property(x => x.StaffId).HasColumnName(WorkScheduleConst.FIELD_STAFF_ID);
            builder.Property(x => x.WorkDate).HasColumnName(WorkScheduleConst.FIELD_WORK_DATE);
            builder.Property(x => x.CreatedAt).HasColumnName(WorkScheduleConst.FIELD_CREATED_AT);
            builder.Property(x => x.UpdatedAt).HasColumnName(WorkScheduleConst.FIELD_UPDATED_AT);

            builder.HasOne(x => x.ShiftPeriod).WithMany(x => x.WorkSchedules).HasForeignKey(x => x.ShiftPeriodId).IsRequired();
            builder.HasOne(x => x.Staff).WithMany().HasForeignKey(x => x.StaffId).IsRequired();
            builder.Property(x => x.SalonId).HasColumnName(WorkScheduleConst.FIELD_SALON_ID);
            builder.HasOne(x => x.Salon).WithMany().HasForeignKey(x => x.SalonId).IsRequired(false);

            builder.ToTable(WorkScheduleConst.TABLE_NAME);
        }
    }
}
