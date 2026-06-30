namespace _66SMS.Domain.Constants
{
    public class StaffCertificateConst
    {
        #region Database
        public const string TABLE_NAME = "staff_certificates";
        public const string FIELD_ID = "id";
        public const string FIELD_STAFF_ID = "staff_id";
        public const string FIELD_CERTIFICATE_TYPE_ID = "certificate_type_id";
        public const string FIELD_CERTIFICATE_NAME = "certificate_name";
        public const string FIELD_CERTIFICATE_NUMBER = "certificate_number";
        public const string FIELD_ISSUING_ORGANIZATION = "issuing_organization";
        public const string FIELD_ISSUED_DATE = "issued_date";
        public const string FIELD_EXPIRY_DATE = "expiry_date";
        public const string FIELD_DOCUMENT_URL = "document_url";
        public const string FIELD_NOTE = "note";
        public const string FIELD_STATUS = "status";
        public const string FIELD_CREATED_AT = "created_at";
        public const string FIELD_CREATED_BY = "created_by";
        public const string FIELD_UPDATED_AT = "updated_at";
        public const string FIELD_UPDATED_BY = "updated_by";
        #endregion

        #region Constraint
        public const int CERTIFICATE_NAME_MAX_LENGTH = 300;
        public const int CERTIFICATE_NUMBER_MAX_LENGTH = 100;
        public const int ISSUING_ORGANIZATION_MAX_LENGTH = 300;
        public const int DOCUMENT_URL_MAX_LENGTH = 500;
        public const int NOTE_MAX_LENGTH = 500;
        #endregion

        #region Status
        public const int STATUS_PENDING_VERIFICATION = 0;
        public const int STATUS_ACTIVED = 1;
        public const int STATUS_EXPIRED = 2;
        public const int STATUS_REVOKED = 3;
        public const int STATUS_DELETED = 9;
        #endregion

        #region Message
        public const string MSG_NOT_FOUND = "Chứng chỉ nhân viên không tồn tại.";
        public const string MSG_ID_NOT_FOUND = $"{nameof(Entities.StaffCertificate)} with id not found";
        #endregion
    }
}
