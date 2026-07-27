using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class LandingBannerConfiguration : IEntityTypeConfiguration<LandingBanner>
    {
        public void Configure(EntityTypeBuilder<LandingBanner> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(LandingBannerConst.FIELD_ID);
            builder.Property(x => x.Title).HasColumnName(LandingBannerConst.FIELD_TITLE)
                .HasMaxLength(LandingBannerConst.TITLE_MAX_LENGTH).IsRequired();
            builder.Property(x => x.Subtitle).HasColumnName(LandingBannerConst.FIELD_SUBTITLE)
                .HasMaxLength(LandingBannerConst.SUBTITLE_MAX_LENGTH);
            builder.Property(x => x.BrandLabel).HasColumnName(LandingBannerConst.FIELD_BRAND_LABEL)
                .HasMaxLength(LandingBannerConst.BRAND_LABEL_MAX_LENGTH);
            builder.Property(x => x.ImageUrl).HasColumnName(LandingBannerConst.FIELD_IMAGE_URL);
            builder.Property(x => x.CtaPrimaryText).HasColumnName(LandingBannerConst.FIELD_CTA_PRIMARY_TEXT)
                .HasMaxLength(LandingBannerConst.CTA_TEXT_MAX_LENGTH);
            builder.Property(x => x.CtaPrimaryHref).HasColumnName(LandingBannerConst.FIELD_CTA_PRIMARY_HREF)
                .HasMaxLength(LandingBannerConst.CTA_HREF_MAX_LENGTH);
            builder.Property(x => x.CtaSecondaryText).HasColumnName(LandingBannerConst.FIELD_CTA_SECONDARY_TEXT)
                .HasMaxLength(LandingBannerConst.CTA_TEXT_MAX_LENGTH);
            builder.Property(x => x.CtaSecondaryHref).HasColumnName(LandingBannerConst.FIELD_CTA_SECONDARY_HREF)
                .HasMaxLength(LandingBannerConst.CTA_HREF_MAX_LENGTH);
            builder.Property(x => x.SortOrder).HasColumnName(LandingBannerConst.FIELD_SORT_ORDER);
            builder.Property(x => x.Status).HasColumnName(LandingBannerConst.FIELD_STATUS);
            builder.Property(x => x.CreatedAt).HasColumnName(LandingBannerConst.FIELD_CREATED_AT);
            builder.Property(x => x.UpdatedAt).HasColumnName(LandingBannerConst.FIELD_UPDATED_AT);
            builder.ToTable(LandingBannerConst.TABLE_NAME);
        }
    }
}
