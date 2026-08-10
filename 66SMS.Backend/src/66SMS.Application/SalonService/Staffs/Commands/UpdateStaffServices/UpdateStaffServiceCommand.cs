using MediatR;
using _66SMS.Contract.Shared;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Staffs.Commands.UpdateStaffServices;

public class UpdateStaffServiceCommand : IRequest<Result<object>>
{
    [JsonIgnore]
    public int? Id { get; set; }
    public int? StaffId { get; set; }
    public int? ServiceId { get; set; }
    public int? Status { get; set; }
}
