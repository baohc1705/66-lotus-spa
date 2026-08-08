using _66SMS.Contract.Helpers;

namespace _66SMS.Domain.Constants
{
    public class LandingBannerConst
    {
        #region Database
        public const string TABLE_NAME = "landing_banners";
        public const string FIELD_ID = "id";
        public const string FIELD_TITLE = "title";
        public const string FIELD_SUBTITLE = "subtitle";
        public const string FIELD_BRAND_LABEL = "brand_label";
        public const string FIELD_IMAGE_URL = "image_url";
        public const string FIELD_CTA_PRIMARY_TEXT = "cta_primary_text";
        public const string FIELD_CTA_PRIMARY_HREF = "cta_primary_href";
        public const string FIELD_CTA_SECONDARY_TEXT = "cta_secondary_text";
        public const string FIELD_CTA_SECONDARY_HREF = "cta_secondary_href";
        public const string FIELD_SORT_ORDER = "sort_order";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_UPDATED_AT = "updated_at";
        #endregion

        #region Constraint
        public const int TITLE_MAX_LENGTH = 200;
        public const int SUBTITLE_MAX_LENGTH = 1000;
        public const int BRAND_LABEL_MAX_LENGTH = 200;
        public const int CTA_TEXT_MAX_LENGTH = 100;
        public const int CTA_HREF_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_INACTIVE = 0;
        public const int STATUS_ACTIVE = 1;
        public const int STATUS_DELETED = 2;
        #endregion

        #region Message
        public const string MSG_NOT_FOUND = "Không tìm thấy banner landing.";
        #endregion

        #region Image Storage
        public const string IMAGE_FOLDER = "landing-banners";
        public const string IMAGE_FILE_PREFIX = "landing_banner";

        public static string GenerateImageFileName(int entityId)
            => string.Format("{0}_{1}_{2}", IMAGE_FILE_PREFIX, entityId, DateTimeHelper.UtcNowString());
        #endregion
    }
}
