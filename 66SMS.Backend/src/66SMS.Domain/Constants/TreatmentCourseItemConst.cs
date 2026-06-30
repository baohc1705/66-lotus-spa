namespace _66SMS.Domain.Constants
{
    public class TreatmentCourseItemConst
    {
        #region Database
        public const string TABLE_NAME = "treatment_course_items";
        public const string FIELD_ID = "id";
        public const string FIELD_TREATMENT_COURSE_ID = "treatment_course_id";
        public const string FIELD_SERVICE_ID = "service_id";
        public const string FIELD_SESSION_NUMBER = "session_number";
        public const string FIELD_QUANTITY = "quantity";
        public const string FIELD_NOTE = "note";
        public const string FIELD_STATUS = "status";
        #endregion

        #region Constraint
        public const int NOTE_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_INACTIVED = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_DELETED = 2;
        #endregion
    }
}
