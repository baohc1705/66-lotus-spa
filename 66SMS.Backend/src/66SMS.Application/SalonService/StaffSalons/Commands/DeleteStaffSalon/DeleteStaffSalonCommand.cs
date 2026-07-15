using System.Text.Json.Serialization;
using _66SMS.Contracts.Shared;
using MediatR;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.SalonService.StaffSalons.Commands.DeleteStaffSalon
{
    public class DeleteStaffSalonCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        [JsonIgnore]
        public DateTimeOffset? UpdatedAt { get; set; } = DateTimeHelper.UtcNow();
        
    }
}
