using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class ServiceImageConfiguration : IEntityTypeConfiguration<ServiceImage>
    {
        public void Configure(EntityTypeBuilder<ServiceImage> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(ServiceImageConst.FIELD_ID);
            builder.Property(x => x.ServiceId).HasColumnName(ServiceImageConst.FIELD_SERVICE_ID);
            builder.Property(x => x.Url).HasColumnName(ServiceImageConst.FIELD_URL);
            builder.Property(x => x.SortOrder).HasColumnName(ServiceImageConst.FIELD_SORT_ORDER);
            builder.Property(x => x.IsPrimary).HasColumnName(ServiceImageConst.FIELD_IS_PRIMARY);
            builder.HasOne(x => x.Service).WithMany(s => s.Images).HasForeignKey(x => x.ServiceId).IsRequired(false);
            builder.ToTable(ServiceImageConst.TABLE_NAME);
        }
    }
}
