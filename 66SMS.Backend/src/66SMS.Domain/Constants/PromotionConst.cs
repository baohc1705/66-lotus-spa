namespace _66SMS.Domain.Constants
{
    public class PromotionConst
    {
        #region Database
        public const string TABLE_NAME = "promotions";
        public const string FIELD_ID = "id";
        public const string FIELD_CODE = "code";
        public const string FIELD_NAME = "name";
        public const string FIELD_DESCRIPTION = "description";
        public const string FIELD_DISCOUNT_TYPE = "discount_type";
        public const string FIELD_DISCOUNT_VALUE = "discount_value";
        public const string FIELD_MAX_DISCOUNT_AMOUNT = "max_discount_amount";
        public const string FIELD_MIN_ORDER_VALUE = "min_order_value";
        public const string FIELD_BUY_QUANTITY = "buy_quantity";
        public const string FIELD_GET_QUANTITY = "get_quantity";
        public const string FIELD_USAGE_LIMIT = "usage_limit";
        public const string FIELD_USED_COUNT = "used_count";
        public const string FIELD_START_DATE = "start_date";
        public const string FIELD_END_DATE = "end_date";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Constraint
        public const int CODE_MAX_LENGTH = 50;
        public const int NAME_MAX_LENGTH = 200;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_INACTIVE = 0;
        public const int STATUS_ACTIVE = 1;
        public const int STATUS_DELETED = 2;
        #endregion

        #region Discount Type
        public const int DISCOUNT_TYPE_PERCENT = 1;
        public const int DISCOUNT_TYPE_FIXED = 2;
        public const int DISCOUNT_TYPE_BUYXGETY = 3;
        #endregion

        #region Message
        public const string MSG_PROMOTION_NOT_FOUND = "Không tìm thấy chương trình khuyến mãi.";
        public const string MSG_CODE_EXISTED = "Mã khuyến mãi đã tồn tại.";
        public const string MSG_INVALID = "Thông tin khuyến mãi không hợp lệ.";
        public const string MSG_PROMOTION_EXPIRED = "Mã khuyến mãi đã hết hạn.";
        public const string MSG_PROMOTION_INACTIVE = "Mã khuyến mãi không hoạt động.";
        public const string MSG_PROMOTION_USAGE_LIMIT = "Mã khuyến mãi đã hết lượt sử dụng.";
        public const string MSG_PROMOTION_MIN_ORDER = "Giá trị đơn hàng chưa đạt mức tối thiểu để áp mã.";
        public const string MSG_PROMOTION_APPLY_SUCCESS = "Áp dụng mã khuyến mãi thành công.";
        #endregion
    }
}
