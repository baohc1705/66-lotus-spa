using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class BookingRoomConfiguration : IEntityTypeConfiguration<BookingRoom>
    {
        public void Configure(EntityTypeBuilder<BookingRoom> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(BookingRoomConst.FIELD_ID);
            builder.Property(x => x.Name).HasColumnName(BookingRoomConst.FIELD_NAME).HasMaxLength(BookingRoomConst.NAME_MAX_LENGTH);
            builder.Property(x => x.ImageUrl).HasColumnName(BookingRoomConst.FIELD_IMAGE_URL).HasMaxLength(BookingRoomConst.IMAGE_URL_MAX_LENGTH);
            builder.Property(x => x.Note).HasColumnName(BookingRoomConst.FIELD_NOTE).HasMaxLength(BookingRoomConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(BookingRoomConst.FIELD_STATUS);
            builder.Property(x => x.SalonId).HasColumnName(BookingRoomConst.FIELD_SALON_ID);
            builder.HasOne(x => x.Salon).WithMany(b => b.BookingRooms).HasForeignKey(x => x.SalonId).IsRequired(false);
            builder.ToTable(BookingRoomConst.TABLE_NAME);
        }
    }
}
