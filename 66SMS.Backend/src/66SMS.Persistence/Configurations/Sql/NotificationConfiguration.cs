using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(NotificationTableConst.FIELD_ID);
            builder.Property(x => x.UserId).HasColumnName(NotificationTableConst.FIELD_USER_ID);
            builder.Property(x => x.SalonId).HasColumnName(NotificationTableConst.FIELD_SALON_ID);
            builder.Property(x => x.Domain).HasColumnName(NotificationTableConst.FIELD_DOMAIN).HasMaxLength(50);
            builder.Property(x => x.EventType).HasColumnName(NotificationTableConst.FIELD_EVENT_TYPE).HasMaxLength(100);
            builder.Property(x => x.Title).HasColumnName(NotificationTableConst.FIELD_TITLE).HasMaxLength(200);
            builder.Property(x => x.Message).HasColumnName(NotificationTableConst.FIELD_MESSAGE).HasMaxLength(1000);
            builder.Property(x => x.PayloadJson).HasColumnName(NotificationTableConst.FIELD_PAYLOAD_JSON).HasColumnType("nvarchar(max)");
            builder.Property(x => x.IsRead).HasColumnName(NotificationTableConst.FIELD_IS_READ);
            builder.Property(x => x.CreatedAt).HasColumnName(NotificationTableConst.FIELD_CREATED_AT);

            builder.ToTable(NotificationTableConst.TABLE_NAME);
        }
    }
}
