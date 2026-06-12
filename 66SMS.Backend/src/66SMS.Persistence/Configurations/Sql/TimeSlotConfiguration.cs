using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class TimeSlotConfiguration : IEntityTypeConfiguration<TimeSlot>
    {
        public void Configure(EntityTypeBuilder<TimeSlot> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(TimeSlotConst.FIELD_ID);
            builder.Property(x => x.StartTime).HasColumnName(TimeSlotConst.FIELD_START_TIME);
            builder.Property(x => x.EndTime).HasColumnName(TimeSlotConst.FIELD_END_TIME);

            builder.ToTable(TimeSlotConst.TABLE_NAME);
        }
    }
}
