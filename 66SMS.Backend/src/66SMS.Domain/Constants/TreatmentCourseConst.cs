using _66SMS.Contract.Helpers;

namespace _66SMS.Domain.Constants
{
    public class TreatmentCourseConst
    {
        #region Database
        public const string TABLE_NAME = "treatment_courses";
        public const string FIELD_ID = "id";
        public const string FIELD_CATEGORY_ID = "category_id";
        public const string FIELD_CODE = "code";
        public const string FIELD_NAME = "name";
        public const string FIELD_DESCRIPTION = "description";
        public const string FIELD_CONTENT = "content";
        public const string FIELD_TOTAL_SESSIONS = "total_sessions";
        public const string FIELD_ORIGINAL_PRICE = "original_price";
        public const string FIELD_SELLING_PRICE = "selling_price";
        public const string FIELD_IMAGE_URL = "image_url";
        public const string FIELD_SORT_ORDER = "sort_order";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        #endregion

        #region Constraint
        public const int CODE_MAX_LENGTH = 50;
        public const int NAME_MAX_LENGTH = 200;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        public const int IMAGE_URL_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_INACTIVED = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_DELETED = 2;
        #endregion

        #region Message
        public const string MSG_NOT_FOUND = "Liá»‡u trÃ¬nh khÃ´ng tá»“n táº¡i.";
        public const string MSG_ID_NOT_FOUND = $"{nameof(Entities.TreatmentCourse)} with id not found";
        #endregion
        #region Image Storage
        public const string IMAGE_FOLDER = "treatment_courses";
        public const string IMAGE_FILE_PREFIX = "treatment_course";

        public static string GenerateImageFileName(int entityId)
            => string.Format("{0}_{1}_{2}", IMAGE_FILE_PREFIX, entityId, DateTimeHelper.UtcNowString());
        #endregion
    }
}
