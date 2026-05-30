namespace _66SMS.Domain.Constants
{
    public class CustomerConst
    {
        #region Database
        public const string TABLE_NAME = "Customers";
        public const string FIELD_ID = "Id";
        public const string FIELD_USER_ID = "UserId";
        public const string FIELD_FULLNAME = "FullName";
        public const string FIELD_AVATAR_URL = "AvatarUrl";
        public const string FIELD_DOB = "DateOfBirth";
        public const string FIELD_GENDER = "Gender";
        public const string FIELD_PHONE = "Phone";
        public const string FIELD_TIER = "Tier";
        public const string FIELD_LOYALTY_POINT = "LoyaltyPoint";
        public const string FIELD_FIRST_PURCHASE_AT = "FirstPurchaseAt";
        public const string FIELD_LAST_PURCHASE_AT = "LastPurchaseAt";
        public const string FIELD_SOURCE = "Source";
        public const string FIELD_STATUS = "Status";
        public const string FIELD_NOTE = "Note";
        public const string FIELD_STREET_ADDRESS = "StreetAddress";
        public const string FIELD_PROVINCE_CODE = "ProvinceCode";
        public const string FIELD_WARD_CODE = "WardCode";
        public const string FIELD_FULL_ADDRESS = "FullAddress";
        public const string FIELD_IS_DELETED = "IsDeleted";
        public const string FIELD_MODIFIED_AT = "ModifiedAt";
        public const string FIELD_CREATED_AT = "CreatedAt";
        #endregion

        #region Constraint
        public const int FULLNAME_MAX_LENGTH = 100;
        public const int AVATAR_MAX_LENGTH = 500;
        public const int PHONE_MAX_LENGTH = 20;
        public const int TIER_MAX_LENGTH = 20;
        public const int SOURCE_MAX_LENGTH = 100;
        public const int NOTE_MAX_LENGTH = 500;
        public const int STREET_MAX_LENGTH = 500;
        #endregion
    }
}
