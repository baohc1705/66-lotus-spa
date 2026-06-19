namespace _66SMS.Domain.Constants
{
    public class BookingPositionConst
    {
        #region Database
        public const string TABLE_NAME = "booking_positions";
        public const string FIELD_ID = "id";
        public const string FIELD_ROOM_ID = "room_id";
        public const string FIELD_NAME = "name";
        public const string FIELD_SORT_ORDER = "sort_order";
        public const string FIELD_NOTE = "note";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Constraint
        public const int NAME_MAX_LENGTH = 100;
        public const int NOTE_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_INACTIVED = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_DELETED = 2;
        #endregion

        #region Message
        public const string MSG_BOOKING_POSITION_ID_NOT_FOUND = $"{nameof(Entities.BookingPosition)} with id not found";
        public const string MSG_BOOKING_POSITION_NOT_FOUND = "Booking position not found.";
        #endregion
    }
}
