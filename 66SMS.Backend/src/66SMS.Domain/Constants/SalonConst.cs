using _66SMS.Contracts.Helpers;

namespace _66SMS.Domain.Constants
{
    public class SalonConst
    {
        #region Database
        public const string TABLE_NAME = "salons";
        public const string FIELD_ID = "id";
        public const string FIELD_CODE = "code";
        public const string FIELD_NAME = "name";
        public const string FIELD_PHONE = "phone";
        public const string FIELD_EMAIL = "email";
        public const string FIELD_STREET_ADDRESS = "street_address";
        public const string FIELD_PROVINCE_CODE = "province_code";
        public const string FIELD_WARD_CODE = "ward_code";
        public const string FIELD_FULL_ADDRESS = "full_address";
        public const string FIELD_LATITUDE = "latitude";
        public const string FIELD_LONGITUDE = "longitude";
        public const string FIELD_WORKING_DAYS = "working_days";
        public const string FIELD_TAX_CODE = "tax_code";
        public const string FIELD_IMAGE_URL = "image_url";
        public const string FIELD_DESCRIPTION = "description";
        public const string FIELD_SORT_ORDER = "sort_order";
        public const string FIELD_IS_PRIMARY = "is_primary";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        #endregion

        #region Constraint
        public const int CODE_MAX_LENGTH = 32;
        public const int NAME_MAX_LENGTH = 200;
        public const int PHONE_MAX_LENGTH = 20;
        public const int EMAIL_MAX_LENGTH = 200;
        public const int STREET_ADDRESS_MAX_LENGTH = 200;
        public const int FULL_ADDRESS_MAX_LENGTH = 500;
        public const int PROVINCE_CODE_MAX_LENGTH = 20;
        public const int WARD_CODE_MAX_LENGTH = 20;
        public const int WORKING_DAYS_MAX_LENGTH = 64;
        public const int TAX_CODE_MAX_LENGTH = 20;
        #endregion

        #region Status
        public const int STATUS_INACTIVE = 0;
        public const int STATUS_ACTIVE = 1;
        public const int STATUS_DELETED = 2;
        public const int STATUS_CLOSED = 3;
        #endregion

        #region Message
        public const string MSG_NOT_FOUND = "Salon with id not found";
        public const string MSG_CODE_EXISTED = "Salon code already exists";
        public const string MSG_SALON_NOT_FOUND = "Salon not found.";
        #endregion

        #region Image Storage
        public const string IMAGE_FOLDER = "salons";
        public const string IMAGE_FILE_PREFIX = "salon";

        public static string GenerateImageFileName(int entityId)
            => string.Format("{0}_{1}_{2}", IMAGE_FILE_PREFIX, entityId, DateTimeHelper.UtcNowString());
        #endregion

        #region Cache
        public const string CACHE_PREFIX = "salons:";
        public static readonly TimeSpan CACHE_TTL_LIST = TimeSpan.FromMinutes(30);
        public static readonly TimeSpan CACHE_TTL_DETAIL = TimeSpan.FromMinutes(45);
        public static string CacheKeyDetail(int id) => $"salon:{id}";
        public static string CacheKeyList(string filterHash) => $"salons:{filterHash}";
        #endregion
    }
}
