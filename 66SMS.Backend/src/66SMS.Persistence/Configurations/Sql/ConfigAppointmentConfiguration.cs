using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class ConfigAppointmentConfiguration : IEntityTypeConfiguration<ConfigAppointment>
    {
        public void Configure(EntityTypeBuilder<ConfigAppointment> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(ConfigAppointmentConst.FIELD_ID);
            builder.Property(x => x.DepositPercent).HasColumnName(ConfigAppointmentConst.FIELD_DEPOSIT_PERCENT);
            builder.Property(x => x.StartTime).HasColumnName(ConfigAppointmentConst.FIELD_START_TIME);
            builder.Property(x => x.EndTime).HasColumnName(ConfigAppointmentConst.FIELD_END_TIME);
            builder.Property(x => x.SlotMinutes).HasColumnName(ConfigAppointmentConst.FIELD_SLOT_MINUTES);
            builder.Property(x => x.SalonId).HasColumnName(ConfigAppointmentConst.FIELD_SALON_ID);

            builder.HasOne(x => x.Salon)
                .WithMany()
                .HasForeignKey(x => x.SalonId)
                .IsRequired(false);

            builder.ToTable(ConfigAppointmentConst.TABLE_NAME);
        }
    }
}
