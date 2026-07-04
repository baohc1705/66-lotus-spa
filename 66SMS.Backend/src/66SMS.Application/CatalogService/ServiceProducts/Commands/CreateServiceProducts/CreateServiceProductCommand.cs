using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.ServiceProducts.Commands.CreateServiceProducts
{
    public class CreateServiceProductCommand : IRequest<Result<int>>
    {
        public int ServiceId { get; set; }
        public int ProductId { get; set; }
        public int QuantityUsed { get; set; }
        public string? Note { get; set; }
        public int Status { get; set; } = 1;
        [JsonIgnore]
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
