namespace _66SMS.Domain.Constants
{
    public class MembershipTierConst
    {
        #region Database
        public const string TABLE_NAME = "membership_tiers";
        public const string FIELD_ID = "id";
        public const string FIELD_NAME = "name";
        public const string FIELD_MIN_SPENDING = "min_spending";
        public const string FIELD_DISCOUNT_PERCENT = "discount_percent";
        public const string FIELD_POINT_MULTIPLIER = "point_multiplier";
        public const string FIELD_BENEFITS = "benefits";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Constraint
        public const int NAME_MAX_LENGTH = 100;
        public const int BENEFITS_MAX_LENGTH = 1000;
        #endregion

        #region Status
        public const int STATUS_ACTIVE = 1;
        public const int STATUS_DELETED = 2;
        #endregion

        #region Message
        public const string MSG_MEMBERSHIP_TIER_ID_NOT_FOUND = $"{nameof(Entities.MembershipTier)} with id not found";
        public const string MSG_MEMBERSHIP_TIER_NOT_FOUND = "Membership tier not found.";
        #endregion
    }
}
