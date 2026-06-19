using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class WardConfiguration : IEntityTypeConfiguration<Ward>
    {
        public void Configure(EntityTypeBuilder<Ward> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(WardConst.FIELD_ID).HasMaxLength(WardConst.CODE_MAX_LENGTH);
            builder.Property(x => x.Name).HasColumnName(WardConst.FIELD_NAME).HasMaxLength(WardConst.NAME_MAX_LENGTH);
            builder.Property(x => x.FullName).HasColumnName(WardConst.FIELD_FULL_NAME).HasMaxLength(WardConst.FULL_NAME_MAX_LENGTH);
            builder.Property(x => x.ProvinceCode).HasColumnName(WardConst.FIELD_PROVINCE_CODE).HasMaxLength(WardConst.PROVINCE_CODE_MAX_LENGTH);
            builder.ToTable(WardConst.TABLE_NAME);
        }
    }
}
