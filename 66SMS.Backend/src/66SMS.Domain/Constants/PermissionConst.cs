namespace _66SMS.Domain.Constants
{
    public class PermissionConst
    {
        #region Database
        public const string TABLE_NAME = "permissions";
        public const string FIELD_ID = "id";
        public const string FIELD_NAME = "name";
        public const string FIELD_RESOURCE = "resource";
        public const string FIELD_ACTION = "action";
        public const string FIELD_DESCRIPTION = "description";
        public const string FIELD_STATUS = "status";
        #endregion

        #region Constraint
        public const int NAME_MAX_LENGTH = 100;
        public const int RESOURCE_MAX_LENGTH = 200;
        public const int ACTION_MAX_LENGTH = 100;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_INACTIVED = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_DELETED = 2;
        #endregion

        #region Message
        public const string MSG_PERMISSION_ID_NOT_FOUND = $"{nameof(Entities.Permission)} with id not found";
        public const string MSG_PERMISSION_NAME_EXISTED = "Permission name already exists.";
        #endregion
    }
}