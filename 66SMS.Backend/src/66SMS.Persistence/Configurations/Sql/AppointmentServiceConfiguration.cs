using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class AppointmentServiceConfiguration : IEntityTypeConfiguration<AppointmentService>
    {
        public void Configure(EntityTypeBuilder<AppointmentService> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(AppointmentServiceConst.FIELD_ID);
            builder.Property(x => x.AppointmentId).HasColumnName(AppointmentServiceConst.FIELD_APPOINTMENT_ID);
            builder.Property(x => x.ServiceId).HasColumnName(AppointmentServiceConst.FIELD_SERVICE_ID);
            builder.Property(x => x.PriceSnapshot).HasColumnName(AppointmentServiceConst.FIELD_PRICE_SNAPSHOT).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.DurationSnapshot).HasColumnName(AppointmentServiceConst.FIELD_DURATION_SNAPSHOT);
            builder.Property(x => x.Quantity).HasColumnName(AppointmentServiceConst.FIELD_QUANTITY);
            builder.Property(x => x.Status).HasColumnName(AppointmentServiceConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(AppointmentServiceConst.FIELD_CREATED_AT);
            builder.Property(x => x.UpdatedAt).HasColumnName(AppointmentServiceConst.FIELD_UPDATED_AT);

            builder.HasOne(x => x.Appointment).WithMany(x => x.Services).HasForeignKey(x => x.AppointmentId).IsRequired(false);
            builder.HasOne(x => x.Service).WithMany().HasForeignKey(x => x.ServiceId).IsRequired(false);

            builder.ToTable(AppointmentServiceConst.TABLE_NAME);
        }
    }
}
