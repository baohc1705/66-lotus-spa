using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.ServiceProducts.Commands.UpdateServiceProducts
{
    public class UpdateServiceProductCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        public int? ProductId { get; set; }
        public int? QuantityUsed { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        [JsonIgnore]
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
