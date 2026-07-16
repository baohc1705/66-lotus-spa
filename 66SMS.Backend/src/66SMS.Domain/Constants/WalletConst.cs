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

        #region Top-up limits
        public const decimal TOP_UP_MIN_AMOUNT = 10000;
        public const decimal TOP_UP_MAX_AMOUNT = 50000000;
        #endregion

        #region Message
        public const string MSG_WALLET_ID_NOT_FOUND = $"{nameof(Entities.Wallet)} with id not found";
        public const string MSG_WALLET_NOT_FOUND = "Ví không tồn tại.";
        public const string MSG_WALLET_INVALID_AMOUNT = "Số tiền phải khác 0.";
        public const string MSG_WALLET_INSUFFICIENT_BALANCE = "Số dư ví không đủ để thanh toán tiền cọc.";
        public const string MSG_WALLET_TRANSACTION_SUCCESS = "Giao dịch thành công.";
        public const string MSG_WALLET_NOT_ACTIVE = "Ví không ở trạng thái hoạt động.";
        public const string MSG_WALLET_TOP_UP_AMOUNT_RANGE = "Số tiền nạp phải từ 10.000đ đến 50.000.000đ.";
        public const string MSG_WALLET_TOP_UP_SUCCESS = "Nạp tiền vào ví thành công.";
        public const string MSG_WALLET_TOP_UP_ALREADY = "Giao dịch nạp tiền đã được ghi nhận trước đó.";
        #endregion
    }
}
