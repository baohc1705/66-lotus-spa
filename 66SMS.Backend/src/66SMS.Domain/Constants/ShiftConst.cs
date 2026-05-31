namespace _66SMS.Domain.Constants
{
    public class ShiftConst
    {
        #region Database
        public const string TABLE_NAME = "Shifts";
        public const string FIELD_ID = "Id";
        public const string FIELD_NAME = "Name";
        public const string FIELD_DESCRIPTION = "Description";
        #endregion

        #region Constraint
        public const int NAME_MAX_LENGTH = 50;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        #endregion
    }
}
