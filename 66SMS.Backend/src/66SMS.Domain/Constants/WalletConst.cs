namespace _66SMS.Domain.Constants
{
    public class WalletConst
    {
        #region Database
        public const string TABLE_NAME = "wallets";
        public const string FIELD_ID = "id";
        public const string FIELD_CUSTOMER_ID = "customer_id";
        public const string FIELD_BALANCE = "balance";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Status
        public const int STATUS_ACTIVE = 1;
        public const int STATUS_LOCKED = 2;
        public const int STATUS_CLOSED = 3;
        #endregion

        #region Message
        public const string MSG_WALLET_ID_NOT_FOUND = $"{nameof(Entities.Wallet)} with id not found";
        #endregion
    }
}
