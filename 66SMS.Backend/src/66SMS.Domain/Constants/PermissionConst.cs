namespace _66SMS.Domain.Constants
{
    public class PermissionConst
    {
        #region Database
        public const string TABLE_NAME = "Permissions";
        public const string FIELD_ID = "Id";
        public const string FIELD_NAME = "Name";
        public const string FIELD_RESOURCE = "Resource";
        public const string FIELD_ACTION = "Action";
        public const string FIELD_DESCRIPTION = "Description";
        public const string FIELD_CREATED_AT = "CreatedAt";
        public const string FIELD_MODIFIED_AT = "ModifiedAt";
        public const string FIELD_IS_DELETED = "IsDeleted";
        #endregion

        #region Constraint
        public const int NAME_MAX_LENGTH = 100;
        public const int RESOURCE_MAX_LENGTH = 200;
        public const int ACTION_MAX_LENGTH = 100;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        #endregion
    }
}