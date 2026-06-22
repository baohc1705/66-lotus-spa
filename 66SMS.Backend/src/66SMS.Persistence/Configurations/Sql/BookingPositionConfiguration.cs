using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class BookingPositionConfiguration : IEntityTypeConfiguration<BookingPosition>
    {
        public void Configure(EntityTypeBuilder<BookingPosition> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(BookingPositionConst.FIELD_ID);
            builder.Property(x => x.RoomId).HasColumnName(BookingPositionConst.FIELD_ROOM_ID);
            builder.Property(x => x.Name).HasColumnName(BookingPositionConst.FIELD_NAME).HasMaxLength(BookingPositionConst.NAME_MAX_LENGTH);
            builder.Property(x => x.SortOrder).HasColumnName(BookingPositionConst.FIELD_SORT_ORDER);
            builder.Property(x => x.Note).HasColumnName(BookingPositionConst.FIELD_NOTE).HasMaxLength(BookingPositionConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(BookingPositionConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(BookingPositionConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(BookingPositionConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(BookingPositionConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(BookingPositionConst.FIELD_UPDATED_BY);
            builder.HasOne(x => x.Room).WithMany(p => p.Positions).HasForeignKey(x => x.RoomId).IsRequired(false);
            builder.ToTable(BookingPositionConst.TABLE_NAME);

        }
    }
}
