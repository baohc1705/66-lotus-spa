namespace _66SMS.Domain.Constants
{
    public class UserConst
    {
        #region Database
        public const string TABLE_NAME = "Users";
        public const string FIELD_ID = "Id";
        public const string FIELD_USERNAME = "UserName";
        public const string FIELD_EMAIL = "EMAIL";
        public const string FIELD_PASSWORD_HASH = "PasswordHash";
        public const string FIELD_IS_EMAIL_CONFIRMED = "IsEmailConfirmed";
        public const string FIELD_ACCESS_FAILED_COUNT = "AccessFailedCount";
        public const string FIELD_STATUS= "Status";
        public const string FIELD_LOCKOUT_END = "LockoutEnd";
        public const string FIELD_LAST_LOGIN_AT = "LastLoginAt";
        public const string FIELD_CREATED_AT = "CreatedAt";
        public const string FIELD_MODIFIED_AT = "ModifiedAt";
        public const string FIELD_IS_DELETED = "IsDeleted";
        public const string FIELD_PASSWORD_RESET_TOKEN = "PasswordResetToken";
        public const string FIELD_PASSWORD_RESET_TOKEN_EXPIRY = "PasswordResetTokenExpiry";
        #endregion

        #region Constraint
        public const int USERNAME_MAX_LENGTH = 100;
        public const int EMAIL_MAX_LENGTH = 100;
        public const int PASSWORDHASH_MAX_LENGTH = 256;
        #endregion
    }
}
