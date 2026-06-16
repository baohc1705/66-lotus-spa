namespace _66SMS.Domain.Constants
{
    public class WorkScheduleConst
    {
        #region Database
        public const string TABLE_NAME = "work_schedules";
        public const string FIELD_ID = "id";
        public const string FIELD_SALON_ID = "salon_id";
        public const string FIELD_SHIFT_PERIOD_ID = "shift_period_id";
        public const string FIELD_STAFF_ID = "staff_id";
        public const string FIELD_WORK_DATE = "work_date";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Status
        public const int STATUS_INACTIVED = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_DELETED = 2;
        #endregion

        #region Message
        public const string MSG_WORK_SCHEDULE_ID_NOT_FOUND = $"{nameof(Entities.WorkSchedule)} with id not found";
        #endregion
    }
}
