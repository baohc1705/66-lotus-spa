using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CustomerService.MembershipTiers.Commands.CreateMembershipTiers
{
    public class CreateMembershipTierCommand : IRequest<Result<int>>
    {
        public string? Code { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal MinSpending { get; set; }
        public int? DiscountPercent { get; set; }
        public decimal PointMultiplier { get; set; }
        public string? Benefits { get; set; }
        public int Status { get; set; }

        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
