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
        public const string FIELD_IMAGE_URL = "image_url";
        public const string FIELD_UPDATED_AT = "updated_at";
        #endregion

        #region Constraint
        public const int CODE_MAX_LENGTH = 32;
        public const int NAME_MAX_LENGTH = 200;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        public const int IMAGE_URL_MAX_LENGTH = 200;
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

        #region Image Storage
        public const string IMAGE_FOLDER = "services";
        public const string IMAGE_FILE_PREFIX = "service";

        public static string GenerateImageFileName(int entityId)
            => string.Format("{0}_{1}_{2}", IMAGE_FILE_PREFIX, entityId, DateTimeOffset.UtcNow.ToString("yyyyMMddHHmmss"));
        #endregion

        #region Cache
        public const string CACHE_PREFIX = "services:";
        public static readonly TimeSpan CACHE_TTL_LIST = TimeSpan.FromMinutes(20);
        public static readonly TimeSpan CACHE_TTL_DETAIL = TimeSpan.FromMinutes(45);
        public static string CacheKeyDetail(int id) => $"service:{id}";
        public static string CacheKeyList(string filterHash) => $"services:{filterHash}";
        #endregion
    }
}
