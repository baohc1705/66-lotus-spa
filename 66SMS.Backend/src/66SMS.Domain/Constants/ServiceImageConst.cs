namespace _66SMS.Domain.Constants
{
    public class ServiceImageConst
    {
        #region Database
        public const string TABLE_NAME = "service_images";
        public const string FIELD_ID = "id";
        public const string FIELD_SERVICE_ID = "service_id";
        public const string FIELD_URL = "url";
        public const string FIELD_SORT_ORDER = "sort_order";
        public const string FIELD_IS_PRIMARY = "is_primary";
        #endregion

        #region Message
        public const string MSG_SERVICE_IMAGE_ID_NOT_FOUND = $"{nameof(Entities.ServiceImage)} with id not found";
        #endregion
    }
}
