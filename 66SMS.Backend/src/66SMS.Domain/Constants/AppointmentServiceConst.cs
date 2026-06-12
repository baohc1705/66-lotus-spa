namespace _66SMS.Domain.Constants
{
    public class AppointmentServiceConst
    {
        #region Database
        public const string TABLE_NAME = "appointment_services";
        public const string FIELD_ID = "id";
        public const string FIELD_APPOINTMENT_ID = "appointment_id";
        public const string FIELD_SERVICE_ID = "service_id";
        public const string FIELD_PRICE_SNAPSHOT = "price_snapshot";
        public const string FIELD_DURATION_SNAPSHOT = "duration_snapshot";
        public const string FIELD_QUANTITY = "quantity";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Status
        public const int STATUS_ACTIVE = 1;
        public const int STATUS_CANCELLED = 2;
        #endregion

        #region Message
        public const string MSG_APPOINTMENT_SERVICE_ID_NOT_FOUND = $"{nameof(Entities.AppointmentService)} with id not found";
        #endregion
    }
}
