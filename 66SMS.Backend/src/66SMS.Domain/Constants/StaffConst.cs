using _66SMS.Contracts.Helpers;

namespace _66SMS.Domain.Constants
{
    public class StaffConst
    {
        #region Database
        public const string TABLE_NAME = "staffs";
        public const string FIELD_ID = "id";
        public const string FIELD_USER_ID = "user_id";
        public const string FIELD_CODE = "code";
        public const string FIELD_FULL_NAME = "full_name";
        public const string FIELD_AVATAR_URL = "avatar_url";
        public const string FIELD_DATE_OF_BIRTH = "date_of_birth";
        public const string FIELD_GENDER = "gender";
        public const string FIELD_NATIONAL_ID = "national_id";
        public const string FIELD_PHONE = "phone";
        public const string FIELD_HIRE_DATE = "hire_date";
        public const string FIELD_CONTRACT_TYPE = "contract_type";
        public const string FIELD_BASIC_SALARY = "basic_salary";
        public const string FIELD_SALARY_TYPE = "salary_type";
        public const string FIELD_STATUS = "status";
        public const string FIELD_STREET_ADDRESS = "street_address";
        public const string FIELD_PROVINCE_CODE = "province_code";
        public const string FIELD_WARD_CODE = "ward_code";
        public const string FIELD_FULL_ADDRESS = "full_address";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_UPDATED_AT = "updated_at";
        #endregion

        #region Constraint
        public const int CODE_MAX_LENGTH = 32;
        public const int FULL_NAME_MAX_LENGTH = 100;
        public const int AVATAR_URL_MAX_LENGTH = 500;
        public const int NATIONAL_ID_MAX_LENGTH = 20;
        public const int PHONE_MAX_LENGTH = 20;
        public const int CONTRACT_TYPE_MAX_LENGTH = 100;
        public const int STREET_ADDRESS_MAX_LENGTH = 200;
        public const int PROVINCE_CODE_MAX_LENGTH = 20;
        public const int WARD_CODE_MAX_LENGTH = 20;
        public const int FULL_ADDRESS_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_INACTIVED = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_DELETED = 2;
        public const int STATUS_RESIGNED = 3;
        #endregion

        #region Salary Type
        public const int SALARY_TYPE_HOURLY = 1;
        public const int SALARY_TYPE_DAILY = 2;
        #endregion

        #region Message
        public const string MSG_STAFF_ID_NOT_FOUND = $"{nameof(Entities.Staff)} with id not found";
        public const string MSG_STAFF_NOT_FOUND = "KhÃ´ng tÃ¬m tháº¥y nhÃ¢n viÃªn.";
        public const string MSG_STAFF_BOOKING_NOT_FOUND = "Lá»‹ch háº¹n khÃ´ng tá»“n táº¡i hoáº·c khÃ´ng thuá»™c vá» nhÃ¢n viÃªn nÃ y.";
        public const string MSG_STAFF_START_SERVICE_OUTSIDE_APPT_WINDOW =
            "Chỉ được bắt đầu phục vụ trong khoảng giờ hẹn.";
        public const string MSG_STAFF_COMPLETE_BEFORE_APPT_END =
            "Chưa đủ thời lượng dịch vụ kể từ lúc bắt đầu phục vụ, không thể hoàn thành sớm.";
        public const string MSG_STAFF_UPDATE_STATUS_SUCCESS = "Cáº­p nháº­t tráº¡ng thÃ¡i thÃ nh cÃ´ng.";
        public const string MSG_KPI_INCOMPLETE = "Náº¿u cáº¥u hÃ¬nh KPI thÃ¬ pháº£i nháº­p cáº£ sá»‘ lÆ°á»£ng má»¥c tiÃªu vÃ  tiá»n thÆ°á»Ÿng.";
        #endregion
        #region Image Storage
        public const string IMAGE_FOLDER = "staffs";
        public const string IMAGE_FILE_PREFIX = "staff";

        public static string GenerateImageFileName(int entityId)
            => string.Format("{0}_{1}_{2}", IMAGE_FILE_PREFIX, entityId, DateTimeHelper.UtcNowString());
        #endregion

        #region Cache
        public static readonly TimeSpan CACHE_TTL_BY_SALON = TimeSpan.FromMinutes(12);
        public static string CacheKeyBySalon(int salonId) => $"staffs:salon:{salonId}";
        #endregion
    }
}
