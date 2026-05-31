namespace _66SMS.Domain.Constants
{
    public class EmployeeConst
    {
        #region Database
        public const string TABLE_NAME = "Employees";
        public const string FIELD_ID = "Id";
        public const string FIELD_USER_ID = "UserId";
        public const string FIELD_CODE = "Code";
        public const string FIELD_FULLNAME = "FullName";
        public const string FIELD_AVATAR_URL = "AvatarUrl";
        public const string FIELD_DOB = "DateOfBirth";
        public const string FIELD_GENDER = "Gender";
        public const string FIELD_NATIONAL_ID = "NationalId";
        public const string FIELD_PHONE = "Phone";
        public const string FIELD_HIRE_DATE = "HireDate";
        public const string FIELD_CONTRACT_TYPE = "ContractType";
        public const string FIELD_BASIC_SALARY = "BasicSalary";
        public const string FIELD_STATUS = "Status";
        public const string FIELD_STREET_ADDRESS = "StreetAddress";
        public const string FIELD_PROVINCE_CODE = "ProvinceCode";
        public const string FIELD_WARD_CODE = "WardCode";
        public const string FIELD_FULL_ADDRESS = "FullAddress";
        public const string FIELD_IS_DELETED = "IsDeleted";
        public const string FIELD_MODIFIED_AT = "ModifiedAt";
        public const string FIELD_CREATED_AT = "CreatedAt";
        #endregion

        #region Constraint
        public const int CODE_MAX_LENGTH = 32;
        public const int FULLNAME_MAX_LENGTH = 100;
        public const int AVATAR_MAX_LENGTH = 500;
        public const int NATIONAL_ID_MAX_LENGTH = 20;
        public const int PHONE_MAX_LENGTH = 20;
        public const int CONTRACT_TYPE_MAX_LENGTH = 100;
        public const int STREET_MAX_LENGTH = 200;
        public const int PROVINCE_MAX_LENGTH = 20;
        public const int WARD_MAX_LENGTH = 20;
        public const int FULL_ADDRESS_MAX_LENGTH = 500;
        #endregion
    }
}
