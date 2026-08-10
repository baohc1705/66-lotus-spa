using System.Text.Json.Serialization;
using _66SMS.Contract.Shared;
using MediatR;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.SalonService.StaffSalons.Commands.UpdateStaffSalon
{
    public class UpdateStaffSalonCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int? Status { get; set; }
        [JsonIgnore]
        public DateTimeOffset? UpdatedAt { get; set; } = DateTimeHelper.UtcNow();
    }
}
