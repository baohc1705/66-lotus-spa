using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.StaffSalons.Commands.RemoveManager
{
    public class RemoveManagerCommand : IRequest<Result<object>>
    {
        public int StaffId { get; set; }
        public int SalonId { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
