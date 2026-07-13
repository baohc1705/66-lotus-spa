using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using MediatR;
using System.Text.Json.Serialization;

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
        public decimal? CommissionRate { get; set; }
        public int? SortOrder { get; set; } = 0;
        public int? Status { get; set; } = ServiceConst.STATUS_ACTIVED;
        [JsonIgnore]
        public int? CreatedBy { get; set; }
        [JsonIgnore]
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        public List<ServiceProductItems>? ServiceProducts { get; set; }
        public List<ServiceImageItems>? ServiceImages { get; set; }
    }

    public class ServiceProductItems
    {
        public int? ServiceId { get; set; }
        public int? ProductId { get; set; }
        public int? QuantityUsed { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; } = ServiceProductConst.STATUS_ACTIVED;
        [JsonIgnore]
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeOffset.UtcNow;
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
