namespace _66SMS.Domain.Constants
{
    public class UserRoleConst
    {
        #region Database
        public const string TABLE_NAME = "UserRoles";
        public const string FIELD_ID = "Id";
        public const string FIELD_USER_ID = "UserId";
        public const string FIELD_ROLE_ID = "RoleId";
        public const string FIELD_ASSIGNED_AT = "AssignedAt";
        public const string FIELD_ASSIGNED_BY = "AssignedBy";
        public const string FIELD_CREATED_AT = "CreatedAt";
        public const string FIELD_MODIFIED_AT = "ModifiedAt";
        public const string FIELD_IS_DELETED = "IsDeleted";
        #endregion

        #region Constraint
        public const int ASSIGNED_BY_MAX_LENGTH = 100;
        #endregion
    }
}