using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
    {
        public void Configure(EntityTypeBuilder<Appointment> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(AppointmentConst.FIELD_ID);
            builder.Property(x => x.AppointmentCode).HasColumnName(AppointmentConst.FIELD_APPOINTMENT_CODE).HasMaxLength(AppointmentConst.APPOINTMENT_CODE_MAX_LENGTH);
            //builder.Property(x => x.CustomerId).HasColumnName(AppointmentConst.FIELD_CUSTOMER_ID);
            builder.Property(x => x.CreatedByUserId).HasColumnName(AppointmentConst.FIELD_CREATED_BY_USER_ID);
            builder.Property(x => x.StaffId).HasColumnName(AppointmentConst.FIELD_STAFF_ID);
            builder.Property(x => x.SlotId).HasColumnName(AppointmentConst.FIELD_SLOT_ID);
            builder.Property(x => x.PositionId).HasColumnName(AppointmentConst.FIELD_POSITION_ID);
            builder.Property(x => x.LockId).HasColumnName(AppointmentConst.FIELD_LOCK_ID);
            builder.Property(x => x.ScheduleId).HasColumnName(AppointmentConst.FIELD_SCHEDULE_ID);
            builder.Property(x => x.AppointmentDate).HasColumnName(AppointmentConst.FIELD_APPOINTMENT_DATE);
            builder.Property(x => x.Source).HasColumnName(AppointmentConst.FIELD_SOURCE);
            builder.Property(x => x.Status).HasColumnName(AppointmentConst.FIELD_STATUS);
            builder.Property(x => x.Note).HasColumnName(AppointmentConst.FIELD_NOTE).HasMaxLength(AppointmentConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.TotalAmount).HasColumnName(AppointmentConst.FIELD_TOTAL_AMOUNT);
            builder.Property(x => x.PaidAmount).HasColumnName(AppointmentConst.FIELD_PAID_AMOUNT);
            builder.Property(x => x.DepositPercent).HasColumnName(AppointmentConst.FIELD_DEPOSIT_PERCENT);
            builder.Property(x => x.DepositDeadlineAt).HasColumnName(AppointmentConst.FIELD_DEPOSIT_DEADLINE_AT);
            builder.Property(x => x.DepositRequestedAt).HasColumnName(AppointmentConst.FIELD_DEPOSIT_REQUESTED_AT);
            builder.Property(x => x.ConfirmedAt).HasColumnName(AppointmentConst.FIELD_CONFIRMED_AT);
            builder.Property(x => x.CompletedAt).HasColumnName(AppointmentConst.FIELD_COMPLETED_AT);
            builder.Property(x => x.CreatedAt).HasColumnName(AppointmentConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(AppointmentConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(AppointmentConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(AppointmentConst.FIELD_UPDATED_BY);

            //builder.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).IsRequired(false);
            builder.HasOne(x => x.CreatedByUser).WithMany().HasForeignKey(x => x.CreatedByUserId).IsRequired(false);
            builder.HasOne(x => x.Staff).WithMany().HasForeignKey(x => x.StaffId).IsRequired(false);
            builder.HasOne(x => x.TimeSlot).WithMany(x => x.Appointments).HasForeignKey(x => x.SlotId).IsRequired(false);
            builder.HasOne(x => x.Position).WithMany().HasForeignKey(x => x.PositionId).IsRequired(false);
            builder.HasOne(x => x.Schedule).WithMany().HasForeignKey(x => x.ScheduleId).IsRequired(false);
            builder.HasOne(x => x.Lock).WithMany().HasForeignKey(x => x.LockId).IsRequired(false);
            builder.Property(x => x.SalonId).HasColumnName(AppointmentConst.FIELD_SALON_ID);
            builder.HasOne(x => x.Salon).WithMany().HasForeignKey(x => x.SalonId).IsRequired(false);

            builder.ToTable(AppointmentConst.TABLE_NAME);
        }
    }
}
