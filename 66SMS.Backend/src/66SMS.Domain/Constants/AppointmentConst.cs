namespace _66SMS.Domain.Constants
{
    public class AppointmentConst
    {
        #region Database
        public const string TABLE_NAME = "appointments";
        public const string FIELD_ID = "id";
        public const string FIELD_APPOINTMENT_CODE = "appointment_code";
        //public const string FIELD_CUSTOMER_ID = "customer_id";
        public const string FIELD_SALON_ID = "salon_id";
        public const string FIELD_CREATED_BY_USER_ID = "created_by_user_id";
        public const string FIELD_STAFF_ID = "staff_id";
        public const string FIELD_SLOT_ID = "slot_id";
        public const string FIELD_POSITION_ID = "position_id";
        public const string FIELD_LOCK_ID = "lock_id";
        public const string FIELD_SCHEDULE_ID = "schedule_id";
        public const string FIELD_APPOINTMENT_DATE = "appointment_date";
        public const string FIELD_SOURCE = "source";
        public const string FIELD_STATUS = "status";
        public const string FIELD_NOTE = "note";
        public const string FIELD_TOTAL_AMOUNT = "total_amount";
        public const string FIELD_PAID_AMOUNT = "paid_amount";
        public const string FIELD_DEPOSIT_PERCENT = "deposit_percent";
        public const string FIELD_DEPOSIT_DEADLINE_AT = "deposit_deadline_at";
        public const string FIELD_DEPOSIT_REQUESTED_AT = "deposit_requested_at";
        public const string FIELD_CONFIRMED_AT = "confirmed_at";
        public const string FIELD_COMPLETED_AT = "completed_at";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Constraint
        public const int APPOINTMENT_CODE_MAX_LENGTH = 50;
        public const int NOTE_MAX_LENGTH = 1000;
        #endregion

        #region Status
        public const int STATUS_PENDING = 1;
        public const int STATUS_CONFIRMED = 2;
        public const int STATUS_WAITING = 3;
        public const int STATUS_IN_SERVICE = 4;
        public const int STATUS_COMPLETED = 5;
        public const int STATUS_CANCELLED = 6;
        public const int STATUS_NO_SHOW = 9;
        #endregion

        #region Message
        public const string MSG_APPOINTMENT_ID_NOT_FOUND = $"{nameof(Entities.Appointment)} with id not found";
        
        #endregion
    }
}
