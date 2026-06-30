using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class AttendanceConfiguration : IEntityTypeConfiguration<Attendance>
    {
        public void Configure(EntityTypeBuilder<Attendance> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(AttendanceConst.FIELD_ID);
            builder.Property(x => x.StaffId).HasColumnName(AttendanceConst.FIELD_STAFF_ID);
            builder.Property(x => x.SalonId).HasColumnName(AttendanceConst.FIELD_SALON_ID);
            builder.Property(x => x.WorkScheduleId).HasColumnName(AttendanceConst.FIELD_WORK_SCHEDULE_ID);
            builder.Property(x => x.WorkDate).HasColumnName(AttendanceConst.FIELD_WORK_DATE);
            builder.Property(x => x.CheckInAt).HasColumnName(AttendanceConst.FIELD_CHECK_IN_AT);
            builder.Property(x => x.CheckOutAt).HasColumnName(AttendanceConst.FIELD_CHECK_OUT_AT);
            builder.Property(x => x.WorkedHours).HasColumnName(AttendanceConst.FIELD_WORKED_HOURS).HasColumnType("decimal(5, 2)");
            builder.Property(x => x.Status).HasColumnName(AttendanceConst.FIELD_STATUS);
            builder.Property(x => x.Note).HasColumnName(AttendanceConst.FIELD_NOTE).HasMaxLength(AttendanceConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.CreatedAt).HasColumnName(AttendanceConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(AttendanceConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(AttendanceConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(AttendanceConst.FIELD_UPDATED_BY);

            builder.HasOne(x => x.Staff).WithMany().HasForeignKey(x => x.StaffId).IsRequired();
            builder.HasOne(x => x.Salon).WithMany().HasForeignKey(x => x.SalonId).IsRequired(false);
            builder.HasOne(x => x.WorkSchedule).WithMany().HasForeignKey(x => x.WorkScheduleId).IsRequired(false);

            builder.ToTable(AttendanceConst.TABLE_NAME);
        }
    }
}
