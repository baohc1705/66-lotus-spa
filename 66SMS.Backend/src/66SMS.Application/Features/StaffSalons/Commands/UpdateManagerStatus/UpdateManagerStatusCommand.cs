using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.StaffSalons.Commands.UpdateManagerStatus
{
    public record UpdateManagerStatusCommand : IRequest<Result<object>>
    {
        public int StaffId { get; init; }
        public int SalonId { get; init; }
        public bool IsAssign { get; set; }
        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
