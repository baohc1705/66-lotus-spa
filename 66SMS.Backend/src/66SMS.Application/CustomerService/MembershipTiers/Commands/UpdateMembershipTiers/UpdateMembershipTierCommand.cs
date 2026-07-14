using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CustomerService.MembershipTiers.Commands.UpdateMembershipTiers
{
    public class UpdateMembershipTierCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }

        public string? Code { get; set; }
        public string? Name { get; set; }
        public decimal? MinSpending { get; set; }
        public int? DiscountPercent { get; set; }
        public decimal? PointMultiplier { get; set; }
        public string? Benefits { get; set; }
        public int? Status { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
