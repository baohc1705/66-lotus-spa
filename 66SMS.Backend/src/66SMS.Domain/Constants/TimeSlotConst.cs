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
        public const string MSG_TIME_SLOT_NOT_FOUND = "Time slot not found.";
        public static int DEFAULT_SLOT_MINUTES = 30;

        public static int ResolveSlotMinutes(TimeOnly start, TimeOnly end)
        {
            var mins = (int)(end - start).TotalMinutes;
            return mins > 0 ? mins : DEFAULT_SLOT_MINUTES;
        }

        public static int CalcSlotsNeeded(int durationMins, int slotMinutes)
        {
            var slot = slotMinutes > 0 ? slotMinutes : DEFAULT_SLOT_MINUTES;
            return Math.Max(1, (int)Math.Ceiling(durationMins / (double)slot));
        }
        #endregion
    }
}
