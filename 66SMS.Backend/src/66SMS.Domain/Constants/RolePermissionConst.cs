namespace _66SMS.Domain.Constants
{
    public class RolePermissionConst
    {
        #region Database
        public const string TABLE_NAME = "role_permissions";
        public const string FIELD_ID = "id";
        public const string FIELD_ROLE_ID = "role_id";
        public const string FIELD_PERMISSION_ID = "permission_id";
        public const string FIELD_ASSIGNED_AT = "assigned_at";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Message
        public const string MSG_ROLE_PERMISSION_ID_NOT_FOUND = $"{nameof(Entities.RolePermission)} with id not found";
        #endregion
    }
}