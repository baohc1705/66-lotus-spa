namespace _66SMS.Domain.Constants
{
    public class StaffSalonConst
    {
        public const string TABLE_NAME      = "staff_salons";
        public const string FIELD_ID        = "id";
        public const string FIELD_STAFF_ID  = "staff_id";
        public const string FIELD_SALON_ID  = "salon_id";
        public const string FIELD_IS_MANAGER   = "is_manager";
        public const string FIELD_START_DATE   = "start_date";
        public const string FIELD_END_DATE     = "end_date";
        public const string FIELD_STATUS       = "status";
        public const string FIELD_CREATED_AT   = "created_at";
        public const string FIELD_CREATED_BY   = "created_by";
        public const string FIELD_UPDATED_AT   = "updated_at";
        public const string FIELD_UPDATED_BY   = "updated_by";

        #region Status
        public const int STATUS_INACTIVE = 0;
        public const int STATUS_ACTIVE   = 1;
        public const int STATUS_DELETED  = 2;
        #endregion

        #region Message
        public const string MSG_STAFF_SALON_NOT_FOUND = "StaffSalon not found.";
        public const string MSG_STAFF_SALON_STAFF_NOT_FOUND = "Staff not found.";
        public const string MSG_STAFF_SALON_SALON_NOT_FOUND = "Salon not found.";
        public const string MSG_STAFF_SALON_MANAGER_NOT_FOUND = "No active manager assignment found for this staff and salon.";
        public const string MSG_STAFF_SALON_ASSIGN_SUCCESS = "Manager assigned successfully.";
        public const string MSG_STAFF_SALON_REMOVE_SUCCESS = "Manager removed successfully.";
        #endregion
    }
}
