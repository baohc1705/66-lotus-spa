using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class AppointmentPaymentConfiguration : IEntityTypeConfiguration<AppointmentPayment>
    {
        public void Configure(EntityTypeBuilder<AppointmentPayment> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(AppointmentPaymentConst.FIELD_ID);
            builder.Property(x => x.AppointmentId).HasColumnName(AppointmentPaymentConst.FIELD_APPOINTMENT_ID);
            builder.Property(x => x.Phase).HasColumnName(AppointmentPaymentConst.FIELD_PHASE);
            builder.Property(x => x.Amount).HasColumnName(AppointmentPaymentConst.FIELD_AMOUNT).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.RefundedAmount).HasColumnName(AppointmentPaymentConst.FIELD_REFUNDED_AMOUNT).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.Method).HasColumnName(AppointmentPaymentConst.FIELD_METHOD);
            builder.Property(x => x.TransactionId).HasColumnName(AppointmentPaymentConst.FIELD_TRANSACTION_ID).HasMaxLength(AppointmentPaymentConst.TRANSACTION_ID_MAX_LENGTH);
            builder.Property(x => x.DueDate).HasColumnName(AppointmentPaymentConst.FIELD_DUE_DATE);
            builder.Property(x => x.Note).HasColumnName(AppointmentPaymentConst.FIELD_NOTE).HasMaxLength(AppointmentPaymentConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(AppointmentPaymentConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(AppointmentPaymentConst.FIELD_CREATED_AT);
            builder.Property(x => x.UpdatedAt).HasColumnName(AppointmentPaymentConst.FIELD_UPDATED_AT);
            builder.HasOne(x => x.Appointment).WithMany(x => x.Payments).HasForeignKey(x => x.AppointmentId).IsRequired(false);
            builder.ToTable(AppointmentPaymentConst.TABLE_NAME);
        }
    }
}
