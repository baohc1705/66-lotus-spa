namespace _66SMS.Domain.Constants
{
    public class ServiceProductConst
    {
        #region Database
        public const string TABLE_NAME = "service_products";
        public const string FIELD_ID = "id";
        public const string FIELD_SERVICE_ID = "service_id";
        public const string FIELD_PRODUCT_ID = "product_id";
        public const string FIELD_QUANTITY_USED = "quantity_used";
        public const string FIELD_NOTE = "note";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_UPDATED_AT = "updated_at";
        #endregion

        #region Constraint
        public const int NOTE_MAX_LENGTH = 500;
        #endregion

        #region Status 
        public const int STATUS_INACTIVE = 0;
        public const int STATUS_ACTIVE = 1;
        public const int STATUS_DELETED = 2;
        #endregion 
    }
}
