using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class ProvinceConfiguration : IEntityTypeConfiguration<Province>
    {
        public void Configure(EntityTypeBuilder<Province> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(ProvinceConst.FIELD_ID).HasMaxLength(ProvinceConst.CODE_MAX_LENGTH);
            builder.Property(x => x.Name).HasColumnName(ProvinceConst.FIELD_NAME).HasMaxLength(ProvinceConst.NAME_MAX_LENGTH);
            builder.Property(x => x.FullName).HasColumnName(ProvinceConst.FIELD_FULL_NAME).HasMaxLength(ProvinceConst.FULL_NAME_MAX_LENGTH);
            builder.ToTable(ProvinceConst.TABLE_NAME);
        }
    }
}
