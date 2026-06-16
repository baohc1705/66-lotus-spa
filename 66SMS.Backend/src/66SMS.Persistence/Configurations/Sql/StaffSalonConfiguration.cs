using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class StaffSalonConfiguration : IEntityTypeConfiguration<StaffSalon>
    {
        public void Configure(EntityTypeBuilder<StaffSalon> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(StaffSalonConst.FIELD_ID);
            builder.Property(x => x.StaffId).HasColumnName(StaffSalonConst.FIELD_STAFF_ID);
            builder.Property(x => x.SalonId).HasColumnName(StaffSalonConst.FIELD_SALON_ID);
            builder.Property(x => x.IsManager).HasColumnName(StaffSalonConst.FIELD_IS_MANAGER);
            builder.Property(x => x.StartDate).HasColumnName(StaffSalonConst.FIELD_START_DATE);
            builder.Property(x => x.EndDate).HasColumnName(StaffSalonConst.FIELD_END_DATE);
            builder.Property(x => x.Status).HasColumnName(StaffSalonConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(StaffSalonConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(StaffSalonConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(StaffSalonConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(StaffSalonConst.FIELD_UPDATED_BY);
            builder.HasOne(x => x.Salon).WithMany(b => b.StaffSalons).HasForeignKey(x => x.SalonId).IsRequired(false);
            builder.HasOne(x => x.Staff).WithMany().HasForeignKey(x => x.StaffId).IsRequired(false);
            builder.ToTable(StaffSalonConst.TABLE_NAME);
        }
    }
}
