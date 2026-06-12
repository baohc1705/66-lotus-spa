namespace _66SMS.Domain.Constants
{
    public class UserRoleConst
    {
        #region Database
        public const string TABLE_NAME = "user_roles";
        public const string FIELD_ID = "id";
        public const string FIELD_USER_ID = "user_id";
        public const string FIELD_ROLE_ID = "role_id";
        public const string FIELD_ASSIGNED_AT = "assigned_at";
        public const string FIELD_ASSIGNED_BY = "assigned_by";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Message
        public const string MSG_USER_ROLE_ID_NOT_FOUND = $"{nameof(Entities.UserRole)} with id not found";
        #endregion
    }
}