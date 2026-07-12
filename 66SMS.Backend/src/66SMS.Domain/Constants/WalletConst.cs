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
        #endregion

        #region Status
        public const int STATUS_ACTIVE = 1;
        public const int STATUS_LOCKED = 2;
        public const int STATUS_CLOSED = 3;
        #endregion

        #region Message
        public const string MSG_WALLET_ID_NOT_FOUND = $"{nameof(Entities.Wallet)} with id not found";
        public const string MSG_WALLET_NOT_FOUND = "Ví không tồn tại.";
        public const string MSG_WALLET_INVALID_AMOUNT = "Số tiền phải khác 0.";
        public const string MSG_WALLET_INSUFFICIENT_BALANCE = "Số dư ví không đủ để thanh toán tiền cọc.";
        public const string MSG_WALLET_TRANSACTION_SUCCESS = "Giao dịch thành công.";
        #endregion
    }
}
