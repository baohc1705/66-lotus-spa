namespace _66SMS.Domain.Constants
{
    public class UserConst
    {
        #region Database
        public const string TABLE_NAME = "users";
        public const string FIELD_ID = "id";
        public const string FIELD_USERNAME = "username";
        public const string FIELD_EMAIL = "email";
        public const string FIELD_PASSWORD_HASH = "password_hash";
        public const string FIELD_IS_EMAIL_CONFIRMED = "is_email_confirmed";
        public const string FIELD_ACCESS_FAILED_COUNT = "access_failed_count";
        public const string FIELD_STATUS = "status";
        public const string FIELD_LOCKOUT_END = "lockout_end";
        public const string FIELD_LAST_LOGIN_AT = "last_login_at";
        public const string FIELD_PASSWORD_RESET_TOKEN = "password_reset_token";
        public const string FIELD_PASSWORD_RESET_TOKEN_EXPIRY = "password_reset_token_expiry";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Constraint
        public const int USERNAME_MAX_LENGTH = 100;
        public const int EMAIL_MAX_LENGTH = 100;
        public const int PASSWORD_HASH_MAX_LENGTH = 256;
        #endregion

        #region Status
        public const int STATUS_INACTIVED = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_DELETED = 2;
        public const int STATUS_LOCKED = 3;
        #endregion

        #region Message
        public const string MSG_USER_ID_NOT_FOUND = $"{nameof(Entities.User)} with id not found";
        #endregion
    }
}
