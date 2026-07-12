namespace _66SMS.Domain.Constants
{
    public class RoleConst
    {
        #region Database
        public const string TABLE_NAME = "roles";
        public const string FIELD_ID = "id";
        public const string FIELD_CODE = "code";
        public const string FIELD_NAME = "name";
        public const string FIELD_DESCRIPTION = "description";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        #endregion

        #region Constraint
        public const int CODE_MAX_LENGTH = 100;
        public const int NAME_MAX_LENGTH = 100;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_INACTIVED = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_DELETED = 2;
        #endregion

        #region Codes
        public const string CODE_CUSTOMER = "customer";
        public const string CODE_ADMIN = "admin";
        public const string CODE_MANAGER = "manager";
        public const string CODE_STAFF = "staff";
        #endregion

        #region Message
        public const string MSG_ROLE_ID_NOT_FOUND = $"{nameof(Entities.Role)} with id not found";
        public const string MSG_ROLE_NOT_FOUND = "Role not found.";
        public const string MSG_ROLE_NAME_EXISTED = "Role name already exists.";
        #endregion
    }
}