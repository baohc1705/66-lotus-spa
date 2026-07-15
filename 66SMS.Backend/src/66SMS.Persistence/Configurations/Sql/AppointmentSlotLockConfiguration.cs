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
            builder.Property(x => x.SlotId).HasColumnName(AppointmentSlotLockConst.FIELD_SLOT_ID);
            builder.Property(x => x.StaffId).HasColumnName(AppointmentSlotLockConst.FIELD_STAFF_ID);
            builder.Property(x => x.PositionId).HasColumnName(AppointmentSlotLockConst.FIELD_POSITION_ID);
            builder.Property(x => x.LockedByUserId).HasColumnName(AppointmentSlotLockConst.FIELD_LOCKED_BY_USER_ID);
            builder.Property(x => x.AppointmentDate).HasColumnName(AppointmentSlotLockConst.FIELD_APPOINTMENT_DATE);
            builder.Property(x => x.SlotsNeeded).HasColumnName(AppointmentSlotLockConst.FIELD_SLOTS_NEEDED);
            builder.Property(x => x.LockedAt).HasColumnName(AppointmentSlotLockConst.FIELD_LOCKED_AT);
            builder.Property(x => x.ExpiresAt).HasColumnName(AppointmentSlotLockConst.FIELD_EXPIRES_AT);
            builder.Property(x => x.ReleasedAt).HasColumnName(AppointmentSlotLockConst.FIELD_RELEASED_AT);
            builder.Property(x => x.Status).HasColumnName(AppointmentSlotLockConst.FIELD_STATUS);

            builder.HasOne(x => x.Appointment).WithMany(x => x.SlotLocks).HasForeignKey(x => x.AppointmentId).IsRequired(false);
            builder.HasOne(x => x.TimeSlot).WithMany(x => x.SlotLocks).HasForeignKey(x => x.SlotId).IsRequired(false);
            builder.HasOne(x => x.Staff).WithMany().HasForeignKey(x => x.StaffId).IsRequired(false);
            builder.HasOne(x => x.Position).WithMany().HasForeignKey(x => x.PositionId).IsRequired(false);
            builder.HasOne(x => x.LockedByUser).WithMany().HasForeignKey(x => x.LockedByUserId).IsRequired(false);

            // 1 winner: chỉ 1 lock ACTIVE / (staff, date, start slot). RELEASED/EXPIRED được trùng.
            builder.HasIndex(x => new { x.StaffId, x.AppointmentDate, x.SlotId })
                .IsUnique()
                .HasFilter($"[{AppointmentSlotLockConst.FIELD_STATUS}] = {AppointmentSlotLockConst.STATUS_ACTIVE}")
                .HasDatabaseName("UX_slot_lock_active_staff_date_slot");

            builder.ToTable(AppointmentSlotLockConst.TABLE_NAME);
        }
    }
}
