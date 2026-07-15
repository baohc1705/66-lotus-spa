using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities;

public class StaffService : EntityBase<int>
{
    public int StaffId { get; set; }
    public int ServiceId { get; set; }
    public int Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    #region Navigation Properties
    public Staff? Staff { get; set; }
    public Service? Service { get; set; }
    #endregion
}
