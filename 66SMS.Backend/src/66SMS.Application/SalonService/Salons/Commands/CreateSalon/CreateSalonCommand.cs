using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.SalonService.Salons.Commands.CreateSalon
{
    /// <summary>
    /// Create salon request
    /// </summary>
    public class CreateSalonCommand : IRequest<Result<object>>
    {
        //public string? Code { get; set; } 
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
        /// <summary>Base64 ảnh mới — upload qua IImageUploadService.</summary>
        public string? ImageBase64 { get; set; }
        public string? Description { get; set; }
        public int? SortOrder { get; set; } = 0;
        public bool? IsPrimary { get; set; }
        public int? Status { get; set; } = (int)StatusActiveEnum.ACTIVED;
        [JsonIgnore]
        public int? CreatedBy { get; set; }
        [JsonIgnore]
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeHelper.UtcNow();
        
    }
}
