namespace _66SMS.Domain.Constants
{
    public class TimeSlotConst
    {
        #region Database
        public const string TABLE_NAME = "time_slots";
        public const string FIELD_ID = "id";
        public const string FIELD_START_TIME = "start_time";
        public const string FIELD_END_TIME = "end_time";
        #endregion

        #region Message
        public const string MSG_TIME_SLOT_ID_NOT_FOUND = $"{nameof(Entities.TimeSlot)} with id not found";
        #endregion
    }
}
