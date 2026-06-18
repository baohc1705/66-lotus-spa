using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.StaffSalons.Commands.AssignManager
{
    public class AssignManagerCommand : IRequest<Result<object>>
    {
        public int StaffId { get; set; }
        public int SalonId { get; set; }
        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
