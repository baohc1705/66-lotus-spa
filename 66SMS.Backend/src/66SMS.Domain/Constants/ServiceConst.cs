namespace _66SMS.Domain.Constants
{
    public class ServiceConst
    {
        #region Database
        public const string TABLE_NAME = "services";
        public const string FIELD_ID = "id";
        public const string FIELD_CATEGORY_ID = "category_id";
        public const string FIELD_CODE = "code";
        public const string FIELD_NAME = "name";
        public const string FIELD_DESCRIPTION = "description";
        public const string FIELD_CONTENT = "content";
        public const string FIELD_DURATION_MINS = "duration_mins";
        public const string FIELD_COST_PRICE = "cost_price";
        public const string FIELD_SELLING_PRICE = "selling_price";
        public const string FIELD_COMMISSION_RATE = "commission_rate";
        public const string FIELD_SORT_ORDER = "sort_order";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Constraint
        public const int CODE_MAX_LENGTH = 32;
        public const int NAME_MAX_LENGTH = 200;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_INACTIVED = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_DELETED = 2;
        #endregion

        #region Message
        public const string MSG_SERVICE_ID_NOT_FOUND = $"{nameof(Entities.Service)} with id not found";
        public const string MSG_SERVICE_NOT_FOUND = "Service not found.";
        public const string MSG_SERVICE_PRODUCT_NOT_FOUND = "Dịch vụ không tồn tại.";
        #endregion
    }
}
