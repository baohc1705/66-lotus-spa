using System.Text.Json.Serialization;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.StaffSalons.Commands.CreateStaffSalon
{
    public class CreateStaffSalonCommand : IRequest<Result<object>>
    {
        public int? StaffId { get; set; }
        public int? SalonId { get; set; }
        public bool? IsManager { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int? Status { get; set; }
        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
