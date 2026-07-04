namespace _66SMS.Domain.Constants
{
    public class AppointmentPaymentConst
    {
        #region Database
        public const string TABLE_NAME = "appointment_payments";
        public const string FIELD_ID = "id";
        public const string FIELD_APPOINTMENT_ID = "appointment_id";
        public const string FIELD_PHASE = "phase";
        public const string FIELD_AMOUNT = "amount";
        public const string FIELD_REFUNDED_AMOUNT = "refunded_amount";
        public const string FIELD_METHOD = "method";
        public const string FIELD_TRANSACTION_ID = "transaction_id";
        public const string FIELD_DUE_DATE = "due_date";
        public const string FIELD_NOTE = "note";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_UPDATED_AT = "updated_at";
        #endregion

        #region Constraint
        public const int TRANSACTION_ID_MAX_LENGTH = 100;
        public const int NOTE_MAX_LENGTH = 1000;
        #endregion

        #region Phase
        public const int PHASE_DEPOSIT = 1;
        public const int PHASE_FINAL_PAYMENT = 2;
        #endregion

        #region Method
        public const int METHOD_CASH = 1;
        public const int METHOD_BANK_TRANSFER = 2;
        public const int METHOD_WALLET = 3;
        #endregion

        #region Status
        public const int STATUS_PENDING = 1;
        public const int STATUS_PAID = 2;
        public const int STATUS_REFUNDED = 3;
        public const int STATUS_FAILED = 4;
        #endregion

        #region Message
        public const string MSG_APPOINTMENT_PAYMENT_ID_NOT_FOUND = $"{nameof(Entities.AppointmentPayment)} with id not found";
        public const string MSG_PAYMENT_TRANSACTION_FAILED = "Giao dịch thất bại hoặc sai chữ ký.";
        public const string MSG_PAYMENT_ORDER_NOT_FOUND = "Không tìm thấy đơn.";
        #endregion
    }
}
