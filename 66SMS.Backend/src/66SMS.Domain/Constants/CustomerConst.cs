namespace _66SMS.Domain.Constants
{
    public class CustomerConst
    {
        #region Database
        public const string TABLE_NAME = "customers";
        public const string FIELD_ID = "id";
        public const string FIELD_USER_ID = "user_id";
        public const string FIELD_FULL_NAME = "full_name";
        public const string FIELD_AVATAR_URL = "avatar_url";
        public const string FIELD_DATE_OF_BIRTH = "date_of_birth";
        public const string FIELD_GENDER = "gender";
        public const string FIELD_PHONE = "phone";
        public const string FIELD_LOYALTY_POINT = "loyalty_point";
        public const string FIELD_FIRST_PURCHASE_AT = "first_purchase_at";
        public const string FIELD_LAST_PURCHASE_AT = "last_purchase_at";
        public const string FIELD_SOURCE = "source";
        public const string FIELD_STATUS = "status";
        public const string FIELD_NOTE = "note";
        public const string FIELD_STREET_ADDRESS = "street_address";
        public const string FIELD_PROVINCE_CODE = "province_code";
        public const string FIELD_WARD_CODE = "ward_code";
        public const string FIELD_FULL_ADDRESS = "full_address";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_UPDATED_AT = "updated_at";
        #endregion

        #region Constraint
        public const int FULL_NAME_MAX_LENGTH = 100;
        public const int AVATAR_URL_MAX_LENGTH = 500;
        public const int PHONE_MAX_LENGTH = 20;
        public const int SOURCE_MAX_LENGTH = 100;
        public const int NOTE_MAX_LENGTH = 500;
        public const int STREET_ADDRESS_MAX_LENGTH = 200;
        public const int PROVINCE_CODE_MAX_LENGTH = 20;
        public const int WARD_CODE_MAX_LENGTH = 20;
        public const int FULL_ADDRESS_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_INACTIVED = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_DELETED = 2;
        #endregion

        #region Message
        public const string MSG_CUSTOMER_ID_NOT_FOUND = $"{nameof(Entities.Customer)} with id not found";
        public const string MSG_CUSTOMER_NOT_FOUND = "Customer not found.";
        #endregion
    }
}
