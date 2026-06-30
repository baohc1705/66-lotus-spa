using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace _66SMS.Persistence.Configurations.Sql
{
    public class InvoiceItemConfiguration : IEntityTypeConfiguration<InvoiceItem>
    {
        public void Configure(EntityTypeBuilder<InvoiceItem> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName(InvoiceItemConst.FIELD_ID);
            builder.Property(x => x.InvoiceId).HasColumnName(InvoiceItemConst.FIELD_INVOICE_ID);
            builder.Property(x => x.ItemType).HasColumnName(InvoiceItemConst.FIELD_ITEM_TYPE);
            builder.Property(x => x.RefId).HasColumnName(InvoiceItemConst.FIELD_REF_ID);
            builder.Property(x => x.ItemName).HasColumnName(InvoiceItemConst.FIELD_ITEM_NAME).HasMaxLength(InvoiceItemConst.ITEM_NAME_MAX_LENGTH);
            builder.Property(x => x.UnitPrice).HasColumnName(InvoiceItemConst.FIELD_UNIT_PRICE).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.Quantity).HasColumnName(InvoiceItemConst.FIELD_QUANTITY);
            builder.Property(x => x.DiscountAmount).HasColumnName(InvoiceItemConst.FIELD_DISCOUNT_AMOUNT).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.LineTotal).HasColumnName(InvoiceItemConst.FIELD_LINE_TOTAL).HasColumnType("decimal(18, 0)");
            builder.Property(x => x.StaffId).HasColumnName(InvoiceItemConst.FIELD_STAFF_ID);
            builder.Property(x => x.Note).HasColumnName(InvoiceItemConst.FIELD_NOTE).HasMaxLength(InvoiceItemConst.NOTE_MAX_LENGTH);
            builder.Property(x => x.Status).HasColumnName(InvoiceItemConst.FIELD_STATUS);

            builder.HasOne(x => x.Invoice).WithMany(i => i.Items).HasForeignKey(x => x.InvoiceId).IsRequired(false);
            builder.HasOne(x => x.Staff).WithMany().HasForeignKey(x => x.StaffId).IsRequired(false);

            builder.ToTable(InvoiceItemConst.TABLE_NAME);
        }
    }
}
