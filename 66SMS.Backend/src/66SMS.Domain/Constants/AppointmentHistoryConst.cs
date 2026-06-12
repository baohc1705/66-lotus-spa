namespace _66SMS.Domain.Constants
{
    public class AppointmentHistoryConst
    {
        #region Database
        public const string TABLE_NAME = "appointment_histories";
        public const string FIELD_ID = "id";
        public const string FIELD_APPOINTMENT_ID = "appointment_id";
        public const string FIELD_OLD_STATUS = "old_status";
        public const string FIELD_NEW_STATUS = "new_status";
        public const string FIELD_NOTE = "note";
        public const string FIELD_CHANGED_BY = "changed_by";
        public const string FIELD_CHANGED_BY_ROLE = "changed_by_role";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        #endregion

        #region Constraint
        public const int NOTE_MAX_LENGTH = 1000;
        #endregion

        #region Message
        public const string MSG_APPOINTMENT_HISTORY_ID_NOT_FOUND = $"{nameof(Entities.AppointmentHistory)} with id not found";
        #endregion
    }
}
