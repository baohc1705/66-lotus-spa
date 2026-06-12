namespace _66SMS.Domain.Constants
{
    public class WalletTransactionConst
    {
        #region Database
        public const string TABLE_NAME = "wallet_transactions";
        public const string FIELD_ID = "id";
        public const string FIELD_WALLET_ID = "wallet_id";
        public const string FIELD_APPOINTMENT_PAYMENT_ID = "appointment_payment_id";
        public const string FIELD_AMOUNT = "amount";
        public const string FIELD_BALANCE_AFTER = "balance_after";
        public const string FIELD_TYPE = "type";
        public const string FIELD_NOTE = "note";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Constraint
        public const int NOTE_MAX_LENGTH = 1000;
        #endregion

        #region Type
        public const int TYPE_REFUND_FROM_APPOINTMENT = 1;
        public const int TYPE_PAYMENT_FOR_APPOINTMENT = 2;
        public const int TYPE_TOP_UP = 3;
        public const int TYPE_ADMIN_ADJUST = 4;
        #endregion

        #region Status
        public const int STATUS_SUCCESS = 1;
        public const int STATUS_FAILED = 2;
        public const int STATUS_REVERSED = 3;
        #endregion

        #region Message
        public const string MSG_WALLET_TRANSACTION_ID_NOT_FOUND = $"{nameof(Entities.WalletTransaction)} with id not found";
        #endregion
    }
}
