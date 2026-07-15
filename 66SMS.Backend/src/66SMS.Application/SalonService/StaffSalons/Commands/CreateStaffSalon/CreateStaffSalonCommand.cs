using System.Text.Json.Serialization;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Enums;
using MediatR;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.SalonService.StaffSalons.Commands.CreateStaffSalon
{
    /// <summary>
    /// Command to create a new staff salon
    /// </summary>
    public class CreateStaffSalonCommand : IRequest<Result<object>>
    {
        public int? StaffId { get; set; }
        public int? SalonId { get; set; }
        public bool? IsManager { get; set; }
        public DateOnly? StartDate { get; set; } = DateTimeHelper.UtcNow().ToDateOnly();
        public DateOnly? EndDate { get; set; }
        public int? Status { get; set; } = (int)StatusActiveEnum.ACTIVED;
        [JsonIgnore]
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeHelper.UtcNow();
    }
}
