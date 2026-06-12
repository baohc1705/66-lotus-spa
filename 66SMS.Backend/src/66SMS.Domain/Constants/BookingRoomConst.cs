namespace _66SMS.Domain.Constants
{
    public class BookingRoomConst
    {
        #region Database
        public const string TABLE_NAME = "booking_rooms";
        public const string FIELD_ID = "id";
        public const string FIELD_NAME = "name";
        public const string FIELD_IMAGE_URL = "image_url";
        public const string FIELD_NOTE = "note";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Constraint
        public const int NAME_MAX_LENGTH = 100;
        public const int IMAGE_URL_MAX_LENGTH = 512;
        public const int NOTE_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_INACTIVED = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_DELETED = 2;
        #endregion

        #region Message
        public const string MSG_BOOKING_ROOM_ID_NOT_FOUND = $"{nameof(Entities.BookingRoom)} with id not found";
        #endregion
    }
}
