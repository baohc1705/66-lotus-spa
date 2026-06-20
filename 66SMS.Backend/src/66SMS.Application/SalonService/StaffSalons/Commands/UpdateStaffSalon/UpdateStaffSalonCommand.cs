using System.Text.Json.Serialization;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.StaffSalons.Commands.UpdateStaffSalon
{
    public class UpdateStaffSalonCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public bool? IsManager { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int? Status { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
