namespace _66SMS.Domain.Constants
{
    public class MembershipCardHistoryConst
    {
        #region Database
        public const string TABLE_NAME = "membership_card_histories";
        public const string FIELD_ID = "id";
        public const string FIELD_MEMBERSHIP_CARD_ID = "membership_card_id";
        public const string FIELD_OLD_TIER_ID = "old_tier_id";
        public const string FIELD_NEW_TIER_ID = "new_tier_id";
        public const string FIELD_REASON = "reason";
        public const string FIELD_CHANGED_BY = "changed_by";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        #endregion

        #region Constraint
        public const int REASON_MAX_LENGTH = 500;
        #endregion

        #region Message
        public const string MSG_MEMBERSHIP_CARD_HISTORY_ID_NOT_FOUND = $"{nameof(Entities.MembershipCardHistory)} with id not found";
        #endregion
    }
}
