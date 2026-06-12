namespace _66SMS.Domain.Constants
{
    public class AppointmentSlotLockConst
    {
        #region Database
        public const string TABLE_NAME = "appointment_slot_locks";
        public const string FIELD_ID = "id";
        public const string FIELD_APPOINTMENT_ID = "appointment_id";
        public const string FIELD_SLOT_ID = "slot_id";
        public const string FIELD_STAFF_ID = "staff_id";
        public const string FIELD_POSITION_ID = "position_id";
        public const string FIELD_LOCKED_BY_USER_ID = "locked_by_user_id";
        public const string FIELD_APPOINTMENT_DATE = "appointment_date";
        public const string FIELD_SLOTS_NEEDED = "slots_needed";
        public const string FIELD_LOCKED_AT = "locked_at";
        public const string FIELD_EXPIRES_AT = "expires_at";
        public const string FIELD_RELEASED_AT = "released_at";
        public const string FIELD_STATUS = "status";
        #endregion

        #region Status
        public const int STATUS_ACTIVE = 1;
        public const int STATUS_RELEASED = 2;
        public const int STATUS_EXPIRED = 3;
        #endregion

        #region Message
        public const string MSG_APPOINTMENT_SLOT_LOCK_ID_NOT_FOUND = $"{nameof(Entities.AppointmentSlotLock)} with id not found";
        #endregion
    }
}
