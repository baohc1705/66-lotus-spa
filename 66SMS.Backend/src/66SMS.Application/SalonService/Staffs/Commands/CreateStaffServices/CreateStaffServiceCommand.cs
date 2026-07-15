using MediatR;
using _66SMS.Contracts.Shared;
using System.Text.Json.Serialization;
using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Enums;

namespace _66SMS.Application.SalonService.Staffs.Commands.CreateStaffServices;

/// <summary>
/// Command để tạo mới một staff service
/// </summary>
public class CreateStaffServiceCommand : IRequest<Result<List<int>>>
{
    public int? StaffId { get; set; }
    public List<int>? ServiceIds { get; set; }
    public int? Status { get; set; } = (int)StatusActiveEnum.ACTIVED;
    [JsonIgnore]
    public DateTimeOffset? CreatedAt { get; set; } = DateTimeHelper.UtcNow();
}
