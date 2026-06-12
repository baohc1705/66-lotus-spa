namespace _66SMS.Domain.Constants
{
    public class ShiftPeriodConst
    {
        #region Database
        public const string TABLE_NAME = "shift_periods";
        public const string FIELD_ID = "id";
        public const string FIELD_SHIFT_ID = "shift_id";
        public const string FIELD_SHIFT_START = "shift_start";
        public const string FIELD_SHIFT_END = "shift_end";
        public const string FIELD_EFFECTIVE_FROM = "effective_from";
        public const string FIELD_EFFECTIVE_TO = "effective_to";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        #endregion

        #region Message
        public const string MSG_SHIFT_PERIOD_ID_NOT_FOUND = $"{nameof(Entities.ShiftPeriod)} with id not found";
        #endregion
    }
}
