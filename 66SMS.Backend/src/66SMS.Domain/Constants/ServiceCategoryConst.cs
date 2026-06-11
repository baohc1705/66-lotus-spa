namespace _66SMS.Domain.Constants
{
    public class ServiceCategoryConst
    {
        #region Database
        public const string TABLE_NAME = "service_categories";
        public const string FIELD_ID = "id";
        public const string FIELD_NAME = "name";
        public const string FIELD_DESCRIPTION = "description";
        public const string FIELD_SORT_ORDER = "sort_order";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_UPDATED_AT = "updated_at";
        #endregion

        #region Constraint
        public const int NAME_MAX_LENGTH = 100;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        #endregion

        #region Status 
        public const int STATUS_INACTIVE = 0;
        public const int STATUS_ACTIVE = 1;
        public const int STATUS_DELETED = 2;
        #endregion 
    }
}
