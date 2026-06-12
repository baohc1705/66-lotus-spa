namespace _66SMS.Domain.Constants
{
    public class MembershipCardConst
    {
        #region Database
        public const string TABLE_NAME = "membership_cards";
        public const string FIELD_ID = "id";
        public const string FIELD_CUSTOMER_ID = "customer_id";
        public const string FIELD_MEMBERSHIP_TIER_ID = "membership_tier_id";
        public const string FIELD_CARD_CODE = "card_code";
        public const string FIELD_ISSUED_AT = "issued_at";
        public const string FIELD_EXPIRES_AT = "expires_at";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Constraint
        public const int CARD_CODE_MAX_LENGTH = 50;
        #endregion

        #region Status
        public const int STATUS_ACTIVE = 1;
        public const int STATUS_EXPIRED = 2;
        public const int STATUS_REVOKED = 3;
        #endregion

        #region Message
        public const string MSG_MEMBERSHIP_CARD_ID_NOT_FOUND = $"{nameof(Entities.MembershipCard)} with id not found";
        #endregion
    }
}
