using Microsoft.EntityFrameworkCore;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using _66SMS.Domain.Constants;

namespace _66SMS.Persistence.Configurations.Sql;

public class StaffServiceConfiguration : IEntityTypeConfiguration<StaffService>
{
    public void Configure(EntityTypeBuilder<StaffService> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName(StaffServiceConst.FIELD_ID);
        builder.Property(x => x.StaffId).HasColumnName(StaffServiceConst.FIELD_STAFF_ID);
        builder.Property(x => x.ServiceId).HasColumnName(StaffServiceConst.FIELD_SERVICE_ID);
        builder.Property(x => x.Status).HasColumnName(StaffServiceConst.FIELD_STATUS);
        builder.Property(x => x.CreatedAt).HasColumnName(StaffServiceConst.FIELD_CREATED_AT);
        builder.HasOne(x => x.Staff).WithMany(b => b.StaffServices).HasForeignKey(x => x.StaffId).IsRequired(false);
        builder.HasOne(x => x.Service).WithMany(b => b.StaffServices).HasForeignKey(x => x.ServiceId).IsRequired(false);
        builder.ToTable(StaffServiceConst.TABLE_NAME);
    }
}
