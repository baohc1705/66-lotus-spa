namespace _66SMS.Domain.Constants
{
    public class WardConst
    {
        #region Database
        public const string TABLE_NAME = "wards";
        public const string FIELD_ID = "code";
        public const string FIELD_NAME = "name";
        public const string FIELD_FULL_NAME = "full_name";
        public const string FIELD_PROVINCE_CODE = "province_code";
        #endregion

        #region Constraint
        public const int CODE_MAX_LENGTH = 20;
        public const int NAME_MAX_LENGTH = 255;
        public const int FULL_NAME_MAX_LENGTH = 255;
        public const int PROVINCE_CODE_MAX_LENGTH = 20;
        #endregion

        #region Cache
        public static readonly TimeSpan CACHE_TTL = TimeSpan.FromHours(24);
        public static string CacheKeyByProvince(string provinceCode) => $"wards:province:{provinceCode}";
        #endregion
    }
}
