using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Staffs.Commands.DeleteStaff
{
    /// <summary>
    /// delete staff with id request
    /// </summary>
    public class DeleteStaffCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
