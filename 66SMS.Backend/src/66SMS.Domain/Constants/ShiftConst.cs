namespace _66SMS.Domain.Constants
{
    public class ShiftConst
    {
        #region Database
        public const string TABLE_NAME = "shifts";
        public const string FIELD_ID = "id";
        public const string FIELD_SALON_ID = "salon_id";
        public const string FIELD_NAME = "name";
        public const string FIELD_DESCRIPTION = "description";
        public const string FIELD_SHIFT_START = "shift_start";
        public const string FIELD_SHIFT_END = "shift_end";
        #endregion

        #region Constraint
        public const int NAME_MAX_LENGTH = 50;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        #endregion

        #region Message
        public const string MSG_SHIFT_ID_NOT_FOUND = $"{nameof(Entities.Shift)} with id not found";
        public const string MSG_SHIFT_END_AFTER_START = "ShiftEnd phải sau ShiftStart.";
        public const string MSG_SHIFT_SALON_REQUIRED = "SalonId là bắt buộc.";
        #endregion
    }
}
