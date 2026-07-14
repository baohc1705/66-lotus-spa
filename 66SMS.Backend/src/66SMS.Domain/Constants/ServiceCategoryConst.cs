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
        public const string FIELD_ICON = "icon";
        public const string FIELD_IMAGE_URL = "image_url";
        #endregion

        #region Constraint
        public const int NAME_MAX_LENGTH = 100;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        public const int ICON_MAX_LENGTH = 200;
        public const int IMAGE_URL_MAX_LENGTH = 200;
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

        #region Image Storage
        public const string IMAGE_FOLDER = "services";
        public const string ICON_FILE_PREFIX = "cat_icon";
        public const string IMAGE_FILE_PREFIX = "cat_image";

        public static string GenerateIconFileName(int entityId) => string.Format("{0}_{1}_{2}", ICON_FILE_PREFIX, entityId, DateTimeOffset.UtcNow.ToString("yyyyMMddHHmmss"));

        public static string GenerateImageFileName(int entityId)  => string.Format("{0}_{1}_{2}", IMAGE_FILE_PREFIX, entityId, DateTimeOffset.UtcNow.ToString("yyyyMMddHHmmss"));
        #endregion

        #region Cache
        public const string CACHE_PREFIX = "service-categories:";
        public static readonly TimeSpan CACHE_TTL = TimeSpan.FromMinutes(45);
        public static string CacheKeyList(string filterHash) => $"service-categories:{filterHash}";
        #endregion
    }
}
