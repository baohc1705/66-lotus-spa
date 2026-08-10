using _66SMS.Contract.Shared;
using _66SMS.Domain.Enums;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.CatalogService.Services.Commands.CreateServices
{
    /// <summary>
    /// Create new service request
    /// </summary>
    public class CreateServiceCommand : IRequest<Result<object>>
    {
        public int? CategoryId { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public int? DurationMins { get; set; }
        public decimal? CostPrice { get; set; }
        public decimal? SellingPrice { get; set; }
        public decimal? MinSellingPrice { get; set; }
        public decimal? CommissionRate { get; set; }
        public int? SortOrder { get; set; } = 0;
        public int? Status { get; set; } = (int)StatusActiveEnum.ACTIVED;
        public string? ImageUrl { get; set; }
    
        [JsonIgnore]
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeHelper.UtcNow();
        public List<ServiceProductItems>? ServiceProducts { get; set; }
        //public List<ServiceImageItems>? ServiceImages { get; set; }
    }

    public class ServiceProductItems
    {
        public int? ServiceId { get; set; }
        public int? ProductId { get; set; }
        public int? QuantityUsed { get; set; }
        public decimal? UnitCost { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; } = (int)StatusActiveEnum.ACTIVED;
        [JsonIgnore]
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeHelper.UtcNow();
        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }

    public class ServiceImageItems
    {
        public int? ServiceId { get; set; }
        public string? Url { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsPrimary { get; set; }
    }
}
