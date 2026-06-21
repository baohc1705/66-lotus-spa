using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Salons.Commands.UpdateSalon
{
    public class UpdateSalonCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? StreetAddress { get; set; }
        public string? ProvinceCode { get; set; }
        public string? WardCode { get; set; }
        public string? FullAddress { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? WorkingDays { get; set; }
        public string? TaxCode { get; set; }
        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
        [JsonIgnore]
        public DateTime? UpdatedAt {  get; set; } = DateTime.UtcNow;
    }
}
