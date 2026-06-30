namespace _66SMS.Domain.Constants
{
    public class InvoiceConst
    {
        #region Database
        public const string TABLE_NAME = "invoices";
        public const string FIELD_ID = "id";
        public const string FIELD_INVOICE_CODE = "invoice_code";
        public const string FIELD_CUSTOMER_ID = "customer_id";
        public const string FIELD_CUSTOMER_NAME = "customer_name";
        public const string FIELD_CUSTOMER_PHONE = "customer_phone";
        public const string FIELD_APPOINTMENT_ID = "appointment_id";
        public const string FIELD_SALON_ID = "salon_id";
        public const string FIELD_CASHIER_ID = "cashier_id";
        public const string FIELD_SUB_TOTAL = "sub_total";
        public const string FIELD_DISCOUNT_AMOUNT = "discount_amount";
        public const string FIELD_MEMBERSHIP_TIER_ID = "membership_tier_id";
        public const string FIELD_MEMBERSHIP_DISCOUNT_AMOUNT = "membership_discount_amount";
        public const string FIELD_LOYALTY_POINTS_USED = "loyalty_points_used";
        public const string FIELD_LOYALTY_POINTS_VALUE = "loyalty_points_value";
        public const string FIELD_LOYALTY_POINTS_EARNED = "loyalty_points_earned";
        public const string FIELD_TAX_AMOUNT = "tax_amount";
        public const string FIELD_TOTAL_AMOUNT = "total_amount";
        public const string FIELD_PAID_AMOUNT = "paid_amount";
        public const string FIELD_CHANGE_AMOUNT = "change_amount";
        public const string FIELD_PAYMENT_METHOD = "payment_method";
        public const string FIELD_TRANSACTION_ID = "transaction_id";
        public const string FIELD_STATUS = "status";
        public const string FIELD_NOTE = "note";
        public const string FIELD_ISSUED_AT = "issued_at";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Constraint
        public const int CODE_MAX_LENGTH = 50;
        public const int CUSTOMER_NAME_MAX_LENGTH = 200;
        public const int CUSTOMER_PHONE_MAX_LENGTH = 20;
        public const int TRANSACTION_ID_MAX_LENGTH = 100;
        public const int NOTE_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_DRAFT = 0;
        public const int STATUS_UNPAID = 1;
        public const int STATUS_PAID = 2;
        public const int STATUS_CANCELLED = 3;
        public const int STATUS_REFUNDED = 4;
        #endregion

        #region Payment Method
        public const int PAYMENT_CASH = 1;
        public const int PAYMENT_BANK_TRANSFER = 2;
        public const int PAYMENT_WALLET = 3;
        public const int PAYMENT_VNPAY = 4;
        #endregion

        #region Business
        // Quy đổi 1 điểm loyalty = bao nhiêu VND khi khách dùng điểm để trừ tiền
        public const decimal POINT_VALUE_VND = 1000;
        #endregion

        #region Message
        public const string MSG_NOT_FOUND = "Hóa đơn không tồn tại.";
        public const string MSG_ID_NOT_FOUND = $"{nameof(Entities.Invoice)} with id not found";
        public const string MSG_NO_ITEMS = "Hóa đơn phải có ít nhất một dòng hàng.";
        public const string MSG_ALREADY_PAID = "Hóa đơn đã thanh toán.";
        public const string MSG_CANNOT_CANCEL = "Không thể hủy hóa đơn ở trạng thái hiện tại.";
        public const string MSG_NOT_ENOUGH_POINTS = "Khách hàng không đủ điểm để sử dụng.";
        public const string MSG_ITEM_REF_NOT_FOUND = "Mặt hàng trong hóa đơn không tồn tại.";
        public const string MSG_INSUFFICIENT_STOCK = "Sản phẩm không đủ tồn kho.";
        #endregion
    }
}
