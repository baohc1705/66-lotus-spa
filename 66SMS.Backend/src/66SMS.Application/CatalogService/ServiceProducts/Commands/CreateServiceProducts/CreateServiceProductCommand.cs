using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.CatalogService.ServiceProducts.Commands.CreateServiceProducts
{
    public class CreateServiceProductCommand : IRequest<Result<int>>
    {
        public int ServiceId { get; set; }
        public int ProductId { get; set; }
        public int QuantityUsed { get; set; }
        public decimal? UnitCost { get; set; }
        public string? Note { get; set; }
        public int Status { get; set; } = 1;
        [JsonIgnore]
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeHelper.UtcNow();
        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
