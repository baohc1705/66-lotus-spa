using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class AppointmentSlotLockConfiguration : IEntityTypeConfiguration<AppointmentSlotLock>
    {
        public void Configure(EntityTypeBuilder<AppointmentSlotLock> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(AppointmentSlotLockConst.FIELD_ID);
            builder.Property(x => x.AppointmentId).HasColumnName(AppointmentSlotLockConst.FIELD_APPOINTMENT_ID);
            builder.Property(x => x.StaffId).HasColumnName(AppointmentSlotLockConst.FIELD_STAFF_ID);
            builder.Property(x => x.PositionId).HasColumnName(AppointmentSlotLockConst.FIELD_POSITION_ID);
            builder.Property(x => x.LockedByUserId).HasColumnName(AppointmentSlotLockConst.FIELD_LOCKED_BY_USER_ID);
            builder.Property(x => x.AppointmentDate).HasColumnName(AppointmentSlotLockConst.FIELD_APPOINTMENT_DATE);
            builder.Property(x => x.SlotsNeeded).HasColumnName(AppointmentSlotLockConst.FIELD_SLOTS_NEEDED);
            builder.Property(x => x.LockedAt).HasColumnName(AppointmentSlotLockConst.FIELD_LOCKED_AT);
            builder.Property(x => x.ExpiresAt).HasColumnName(AppointmentSlotLockConst.FIELD_EXPIRES_AT);
            builder.Property(x => x.ReleasedAt).HasColumnName(AppointmentSlotLockConst.FIELD_RELEASED_AT);
            builder.Property(x => x.Status).HasColumnName(AppointmentSlotLockConst.FIELD_STATUS);
            builder.Property(x => x.StartTime).HasColumnName(AppointmentSlotLockConst.FIELD_START_TIME);
            builder.Property(x => x.EndTime).HasColumnName(AppointmentSlotLockConst.FIELD_END_TIME);
            builder.Property(x => x.SalonId).HasColumnName(AppointmentSlotLockConst.FIELD_SALON_ID);
            builder.Property(x => x.DurationMins).HasColumnName(AppointmentSlotLockConst.FIELD_DURATION_MINS);
            builder.Property(x => x.SlotMinutes).HasColumnName(AppointmentSlotLockConst.FIELD_SLOT_MINUTES);
            builder.Property(x => x.ServiceId).HasColumnName(AppointmentSlotLockConst.FIELD_SERVICE_ID);

            builder.HasOne(x => x.Appointment).WithMany(x => x.SlotLocks).HasForeignKey(x => x.AppointmentId).IsRequired(false);
            builder.HasOne(x => x.Staff).WithMany().HasForeignKey(x => x.StaffId).IsRequired(false);
            builder.HasOne(x => x.Position).WithMany().HasForeignKey(x => x.PositionId).IsRequired(false);
            builder.HasOne(x => x.LockedByUser).WithMany().HasForeignKey(x => x.LockedByUserId).IsRequired(false);
            builder.HasOne(x => x.Salon).WithMany().HasForeignKey(x => x.SalonId).IsRequired(false);
            builder.HasOne(x => x.Service).WithMany().HasForeignKey(x => x.ServiceId).IsRequired(false);

            // 1 winner: chi 1 lock ACTIVE / (staff, date, start_time). RELEASED/EXPIRED duoc trung.
            builder.HasIndex(x => new { x.StaffId, x.AppointmentDate, x.StartTime })
                .IsUnique()
                .HasFilter($"[{AppointmentSlotLockConst.FIELD_STATUS}] = {AppointmentSlotLockConst.STATUS_ACTIVE}")
                .HasDatabaseName("UX_lock_active_staff_date_start");

            builder.ToTable(AppointmentSlotLockConst.TABLE_NAME);
        }
    }
}
