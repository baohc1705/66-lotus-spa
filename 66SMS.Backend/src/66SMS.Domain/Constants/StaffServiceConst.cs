using _66SMS.Domain.Entities;
namespace _66SMS.Domain.Constants;

public class StaffServiceConst
{
    #region Database Defines
    public const string TABLE_NAME = "staff_services";
    public const string FIELD_ID = "id";
    public const string FIELD_STAFF_ID = "staff_id";
    public const string FIELD_SERVICE_ID = "service_id";
    public const string FIELD_STATUS = "status";
    public const string FIELD_CREATED_AT = "created_at";
    #endregion

    #region Message Defines
    public const string MSG_STAFF_SERVICE_ID_NOT_FOUND = $"{nameof(StaffService)} with id not found";
    public const string MSG_STAFF_SERVICE_CONFLICT = "Staff service already exists";
    #endregion
}
