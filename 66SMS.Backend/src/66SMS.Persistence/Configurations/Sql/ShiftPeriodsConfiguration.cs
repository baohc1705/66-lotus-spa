using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class ShiftPeriodsConfiguration : IEntityTypeConfiguration<ShiftPeriod>
    {

        public void Configure(EntityTypeBuilder<ShiftPeriod> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(ShiftPeriodsConst.FIELD_ID);
            builder.Property(x => x.ShiftId).HasColumnName(ShiftPeriodsConst.FIELD_SHIFT_ID);
            builder.Property(x => x.ShiftStart).HasColumnName(ShiftPeriodsConst.FIELD_SHIFT_START);
            builder.Property(x => x.ShiftEnd).HasColumnName(ShiftPeriodsConst.FIELD_SHIFT_END);
            builder.Property(x => x.EffectiveFrom).HasColumnName(ShiftPeriodsConst.FIELD_EFFECTIVE_FROM);
            builder.Property(x => x.EffectiveTo).HasColumnName(ShiftPeriodsConst.FIELD_EFFECTIVE_TO);
            builder.Property(x => x.CreatedAt).HasColumnName(ShiftPeriodsConst.FIELD_CREATED_AT);
            builder.HasOne(x => x.Shift).WithMany(x => x.ShiftPeriods).HasForeignKey(x => x.ShiftId).IsRequired();
            builder.HasMany(x => x.WorkSchedules).WithOne(x => x.ShiftPeriod).HasForeignKey(x => x.ShiftPeriodId);
            builder.ToTable(ShiftPeriodsConst.TABLE_NAME);
        }
    }
}
