using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class AppointmentHistoryConfiguration : IEntityTypeConfiguration<AppointmentHistory>
    {
        public void Configure(EntityTypeBuilder<AppointmentHistory> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(AppointmentHistoryConst.FIELD_ID);
            builder.Property(x => x.AppointmentId).HasColumnName(AppointmentHistoryConst.FIELD_APPOINTMENT_ID);
            builder.Property(x => x.OldStatus).HasColumnName(AppointmentHistoryConst.FIELD_OLD_STATUS);
            builder.Property(x => x.NewStatus).HasColumnName(AppointmentHistoryConst.FIELD_NEW_STATUS);
            builder.Property(x => x.Note).HasColumnName(AppointmentHistoryConst.FIELD_NOTE).HasMaxLength(AppointmentHistoryConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.ChangedBy).HasColumnName(AppointmentHistoryConst.FIELD_CHANGED_BY);
            builder.Property(x => x.ChangedByRole).HasColumnName(AppointmentHistoryConst.FIELD_CHANGED_BY_ROLE);
            builder.Property(x => x.CreatedAt).HasColumnName(AppointmentHistoryConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(AppointmentHistoryConst.FIELD_CREATED_BY);

            builder.HasOne(x => x.Appointment).WithMany(x => x.Histories).HasForeignKey(x => x.AppointmentId).IsRequired(false);
            builder.HasOne(x => x.ChangedByUser).WithMany().HasForeignKey(x => x.ChangedBy).IsRequired(false);

            builder.ToTable(AppointmentHistoryConst.TABLE_NAME);
        }
    }
}
