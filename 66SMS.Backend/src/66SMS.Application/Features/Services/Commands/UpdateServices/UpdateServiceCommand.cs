using _66SMS.Application.DTOs.ServiceProducts;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Services.Commands.UpdateServices
{
    public class UpdateServiceCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        public int? CategoryId { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public int? DurationMins { get; set; }
        public decimal? CostPrice { get; set; }
        public decimal? SellingPrice { get; set; }
        public decimal? CommissionRate { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
