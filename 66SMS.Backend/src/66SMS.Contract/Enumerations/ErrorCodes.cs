namespace _66SMS.Contracts.Enumerations
{
    public enum ErrorCodes
    {
        #region Common
        ERR_VALIDATION_FAILED,
        ERR_NOT_FOUND,
        ERR_SERVER_ERROR,
        ERR_BAD_REQUEST,
        ERR_UNAUTHORIZED,
        ERR_FORBIDDEN,
        ERR_CONFLICT,
        #endregion

        #region ERR_AUTH
        ERR_AUTH_INVALID_CREDENTIALS,
        ERR_AUTH_TOKEN_EXPIRED,
        ERR_AUTH_TOKEN_INVALID,
        ERR_AUTH_REFRESH_TOKEN_EXPIRED,
        ERR_AUTH_REFRESH_TOKEN_INVALID,
        #endregion

        #region User
        ERR_USER_NOT_FOUND,
        ERR_USER_ALREADY_EXISTS,
        ERR_USER_INVALID_PASSWORD,
        ERR_USER_ACCOUNT_LOCKED,
        ERR_USER_ACCOUNT_INACTIVE,
        #endregion
    }
}