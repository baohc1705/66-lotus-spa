namespace _66SMS.Domain.Constants
{
    public class RefreshTokenConst
    {
        #region Database
        public const string TABLE_NAME = "RefreshTokens";
        public const string FIELD_ID = "Id";
        public const string FIELD_USER_ID = "UserId";
        public const string FIELD_TOKEN = "Token";
        public const string FIELD_EXPIRES_AT = "ExpiresAt";
        public const string FIELD_IS_REVOKED = "IsRevoked";
        public const string FIELD_CREATED_BY_IP = "CreatedByIp";
        public const string FIELD_REVOKED_BY_IP = "RevokedByIp";
        public const string FIELD_REVOKED_AT = "RevokedAt";
        public const string FIELD_CREATED_AT = "CreatedAt";
        public const string FIELD_MODIFIED_AT = "ModifiedAt";
        public const string FIELD_IS_DELETED = "IsDeleted";
        #endregion

        #region Constraint
        public const int TOKEN_MAX_LENGTH = 512;
        public const int IP_MAX_LENGTH = 64;
        #endregion
    }
}