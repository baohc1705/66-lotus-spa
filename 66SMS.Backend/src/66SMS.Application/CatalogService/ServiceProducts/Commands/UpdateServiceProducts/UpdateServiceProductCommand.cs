using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.CatalogService.ServiceProducts.Commands.UpdateServiceProducts
{
    public class UpdateServiceProductCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        public int? ProductId { get; set; }
        public int? QuantityUsed { get; set; }
        public decimal? UnitCost { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        [JsonIgnore]
        public DateTimeOffset? UpdatedAt { get; set; } = DateTimeHelper.UtcNow();
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
