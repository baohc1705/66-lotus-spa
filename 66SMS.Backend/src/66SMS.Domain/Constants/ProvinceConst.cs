namespace _66SMS.Domain.Constants
{
    public class ProvinceConst
    {
        #region Database
        public const string TABLE_NAME = "provinces";
        public const string FIELD_ID = "code";
        public const string FIELD_NAME = "name";
        public const string FIELD_FULL_NAME = "full_name";
        #endregion

        #region Constraint
        public const int CODE_MAX_LENGTH = 20;
        public const int NAME_MAX_LENGTH = 255;
        public const int FULL_NAME_MAX_LENGTH = 255;
        #endregion

        #region Cache
        public const string CACHE_KEY_ALL = "provinces:all";
        public static readonly TimeSpan CACHE_TTL = TimeSpan.FromHours(24);
        #endregion
    }
}
