using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class ShiftPeriodConfiguration : IEntityTypeConfiguration<ShiftPeriod>
    {

        public void Configure(EntityTypeBuilder<ShiftPeriod> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(ShiftPeriodConst.FIELD_ID);
            builder.Property(x => x.ShiftId).HasColumnName(ShiftPeriodConst.FIELD_SHIFT_ID);
            builder.Property(x => x.ShiftStart).HasColumnName(ShiftPeriodConst.FIELD_SHIFT_START);
            builder.Property(x => x.ShiftEnd).HasColumnName(ShiftPeriodConst.FIELD_SHIFT_END);
            builder.Property(x => x.EffectiveFrom).HasColumnName(ShiftPeriodConst.FIELD_EFFECTIVE_FROM);
            builder.Property(x => x.EffectiveTo).HasColumnName(ShiftPeriodConst.FIELD_EFFECTIVE_TO);
            builder.Property(x => x.CreatedAt).HasColumnName(ShiftPeriodConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(ShiftPeriodConst.FIELD_CREATED_BY);
            builder.HasOne(x => x.Shift).WithMany(x => x.ShiftPeriods).HasForeignKey(x => x.ShiftId).IsRequired();
            builder.HasMany(x => x.WorkSchedules).WithOne(x => x.ShiftPeriod).HasForeignKey(x => x.ShiftPeriodId);
            builder.ToTable(ShiftPeriodConst.TABLE_NAME);
        }
    }
}
