namespace _66SMS.Domain.Constants
{
    public class CertificateTypeConst
    {
        #region Database
        public const string TABLE_NAME = "certificate_types";
        public const string FIELD_ID = "id";
        public const string FIELD_CODE = "code";
        public const string FIELD_NAME = "name";
        public const string FIELD_DESCRIPTION = "description";
        public const string FIELD_SORT_ORDER = "sort_order";
        public const string FIELD_STATUS = "status";
        #endregion

        #region Constraint
        public const int CODE_MAX_LENGTH = 50;
        public const int NAME_MAX_LENGTH = 200;
        public const int DESCRIPTION_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_INACTIVED = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_DELETED = 2;
        #endregion

        #region Message
        public const string MSG_NOT_FOUND = "Loại chứng chỉ không tồn tại.";
        public const string MSG_CODE_EXISTED = "Mã loại chứng chỉ đã tồn tại.";
        public const string MSG_ID_NOT_FOUND = $"{nameof(Entities.CertificateType)} with id not found";
        #endregion
    }
}
