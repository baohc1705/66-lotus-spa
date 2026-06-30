using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class TreatmentCourseItemConfiguration : IEntityTypeConfiguration<TreatmentCourseItem>
    {
        public void Configure(EntityTypeBuilder<TreatmentCourseItem> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(TreatmentCourseItemConst.FIELD_ID);
            builder.Property(x => x.TreatmentCourseId).HasColumnName(TreatmentCourseItemConst.FIELD_TREATMENT_COURSE_ID);
            builder.Property(x => x.ServiceId).HasColumnName(TreatmentCourseItemConst.FIELD_SERVICE_ID);
            builder.Property(x => x.SessionNumber).HasColumnName(TreatmentCourseItemConst.FIELD_SESSION_NUMBER);
            builder.Property(x => x.Quantity).HasColumnName(TreatmentCourseItemConst.FIELD_QUANTITY);
            builder.Property(x => x.Note).HasColumnName(TreatmentCourseItemConst.FIELD_NOTE).HasMaxLength(TreatmentCourseItemConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(TreatmentCourseItemConst.FIELD_STATUS);
            builder.HasOne(x => x.Course).WithMany(c => c.Items).HasForeignKey(x => x.TreatmentCourseId).IsRequired(false);
            builder.HasOne(x => x.Service).WithMany().HasForeignKey(x => x.ServiceId).IsRequired();
            builder.ToTable(TreatmentCourseItemConst.TABLE_NAME);
        }
    }
}
