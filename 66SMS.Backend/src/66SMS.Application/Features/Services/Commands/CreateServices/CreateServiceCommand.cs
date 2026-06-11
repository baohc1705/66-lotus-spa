using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Services.Commands.CreateServices
{
    public class CreateServiceCommand : IRequest<Result<object>>
    {
        public int? CategoryId { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public int? DurationMins { get; set; }
        public decimal? Price { get; set; }
        public decimal? CommissionRate { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }

        public List<ServiceProductItems>? ServiceProducts { get; set; }
        public List<ServiceImageItems>? ServiceImages { get; set; }
    }

    public class ServiceProductItems
    {
        public int? ServiceId { get; set; }
        public int? ProductId { get; set; }
        public int? QuantityUsed { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ServiceImageItems
    {
        public int? ServiceId { get; set; }
        public string? Url { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsPrimary { get; set; }
    }
}
