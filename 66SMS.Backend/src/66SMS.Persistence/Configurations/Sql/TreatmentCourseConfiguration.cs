using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class TreatmentCourseConfiguration : IEntityTypeConfiguration<TreatmentCourse>
    {
        public void Configure(EntityTypeBuilder<TreatmentCourse> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(TreatmentCourseConst.FIELD_ID);
            builder.Property(x => x.CategoryId).HasColumnName(TreatmentCourseConst.FIELD_CATEGORY_ID);
            builder.Property(x => x.Code).HasColumnName(TreatmentCourseConst.FIELD_CODE).HasMaxLength(TreatmentCourseConst.CODE_MAX_LENGTH);
            builder.Property(x => x.Name).HasColumnName(TreatmentCourseConst.FIELD_NAME).HasMaxLength(TreatmentCourseConst.NAME_MAX_LENGTH);
            builder.Property(x => x.Description).HasColumnName(TreatmentCourseConst.FIELD_DESCRIPTION).HasMaxLength(TreatmentCourseConst.DESCRIPTION_MAX_LENGTH);
            builder.Property(x => x.Content).HasColumnName(TreatmentCourseConst.FIELD_CONTENT);
            builder.Property(x => x.TotalSessions).HasColumnName(TreatmentCourseConst.FIELD_TOTAL_SESSIONS);
            builder.Property(x => x.OriginalPrice).HasColumnName(TreatmentCourseConst.FIELD_ORIGINAL_PRICE).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.SellingPrice).HasColumnName(TreatmentCourseConst.FIELD_SELLING_PRICE).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.ImageUrl).HasColumnName(TreatmentCourseConst.FIELD_IMAGE_URL).HasMaxLength(TreatmentCourseConst.IMAGE_URL_MAX_LENGTH);
            builder.Property(x => x.SortOrder).HasColumnName(TreatmentCourseConst.FIELD_SORT_ORDER);
            builder.Property(x => x.Status).HasColumnName(TreatmentCourseConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(TreatmentCourseConst.FIELD_CREATED_AT);
            builder.Property(x => x.CreatedBy).HasColumnName(TreatmentCourseConst.FIELD_CREATED_BY);
            builder.Property(x => x.UpdatedAt).HasColumnName(TreatmentCourseConst.FIELD_UPDATED_AT);
            builder.Property(x => x.UpdatedBy).HasColumnName(TreatmentCourseConst.FIELD_UPDATED_BY);
            builder.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).IsRequired(false);
            builder.ToTable(TreatmentCourseConst.TABLE_NAME);
        }
    }
}
