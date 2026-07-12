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
        #endregion

        #region Constraint
        public const int NAME_MAX_LENGTH = 100;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_INACTIVED = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_DELETED = 2;
        #endregion

        #region Message
        public const string MSG_SERVICE_CATEGORY_ID_NOT_FOUND = $"{nameof(Entities.ServiceCategory)} with id not found";
        public const string MSG_SERVICE_CATEGORY_NOT_FOUND = "Service category not found.";
        #endregion
    }
}
