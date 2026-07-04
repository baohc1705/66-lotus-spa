namespace _66SMS.Domain.Constants
{
    public class InvoiceItemConst
    {
        #region Database
        public const string TABLE_NAME = "invoice_items";
        public const string FIELD_ID = "id";
        public const string FIELD_INVOICE_ID = "invoice_id";
        public const string FIELD_ITEM_TYPE = "item_type";
        public const string FIELD_REF_ID = "ref_id";
        public const string FIELD_ITEM_NAME = "item_name";
        public const string FIELD_UNIT_PRICE = "unit_price";
        public const string FIELD_QUANTITY = "quantity";
        public const string FIELD_DISCOUNT_AMOUNT = "discount_amount";
        public const string FIELD_LINE_TOTAL = "line_total";
        public const string FIELD_STAFF_ID = "staff_id";
        public const string FIELD_NOTE = "note";
        public const string FIELD_STATUS = "status";
        public const string FIELD_COMMISSION_RATE = "commission_rate";
        public const string FIELD_COMMISSION_AMOUNT = "commission_amount";
        #endregion

        #region Constraint
        public const int ITEM_NAME_MAX_LENGTH = 200;
        public const int NOTE_MAX_LENGTH = 500;
        #endregion

        #region Item Type
        public const int TYPE_SERVICE = 1;
        public const int TYPE_PRODUCT = 2;
        public const int TYPE_TREATMENT_COURSE = 3;
        #endregion

        #region Status
        public const int STATUS_ACTIVE = 1;
        public const int STATUS_DELETED = 2;
        #endregion
    }
}
