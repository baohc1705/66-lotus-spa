using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class ShiftConfiguration : IEntityTypeConfiguration<Shift>
    {
        public void Configure(EntityTypeBuilder<Shift> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(ShiftConst.FIELD_ID);
            builder.Property(x => x.SalonId).HasColumnName(ShiftConst.FIELD_SALON_ID);
            builder.Property(x => x.Name).HasColumnName(ShiftConst.FIELD_NAME).HasMaxLength(ShiftConst.NAME_MAX_LENGTH);
            builder.Property(x => x.Description).HasColumnName(ShiftConst.FIELD_DESCRIPTION).HasMaxLength(ShiftConst.DESCRIPTION_MAX_LENGTH);
            builder.Property(x => x.ShiftStart).HasColumnName(ShiftConst.FIELD_SHIFT_START);
            builder.Property(x => x.ShiftEnd).HasColumnName(ShiftConst.FIELD_SHIFT_END);

            builder.HasOne(x => x.Salon).WithMany().HasForeignKey(x => x.SalonId).IsRequired(false);
            builder.HasMany(x => x.WorkSchedules).WithOne(x => x.Shift).HasForeignKey(x => x.ShiftId);

            builder.ToTable(ShiftConst.TABLE_NAME);
        }
    }
}
