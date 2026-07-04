namespace _66SMS.Domain.Constants
{
    public class RefreshTokenConst
    {
        #region Database
        public const string TABLE_NAME = "refresh_tokens";
        public const string FIELD_ID = "id";
        public const string FIELD_USER_ID = "user_id";
        public const string FIELD_TOKEN = "token";
        public const string FIELD_EXPIRES_AT = "expires_at";
        public const string FIELD_IS_REVOKED = "is_revoked";
        public const string FIELD_CREATED_BY_IP = "created_by_ip";
        public const string FIELD_REVOKED_BY_IP = "revoked_by_ip";
        public const string FIELD_REVOKED_AT = "revoked_at";
        public const string FIELD_CREATED_AT = "created_at";
        #endregion

        #region Constraint
        public const int TOKEN_MAX_LENGTH = 512;
        public const int CREATED_BY_IP_MAX_LENGTH = 64;
        public const int REVOKED_BY_IP_MAX_LENGTH = 64;
        #endregion

        #region Message
        public const string MSG_REFRESH_TOKEN_ID_NOT_FOUND = $"{nameof(Entities.RefreshToken)} with id not found";
        #endregion
    }
}