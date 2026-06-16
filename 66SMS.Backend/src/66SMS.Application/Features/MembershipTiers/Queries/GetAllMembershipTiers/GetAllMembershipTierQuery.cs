using _66SMS.Application.DTOs.MembershipTiers;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.MembershipTiers.Queries.GetAllMembershipTiers
{
    public class GetAllMembershipTierQuery : PageRequest, IRequest<Result<PagedResult<MembershipTierDto>>>
    {
        public string? Keyword { get; set; }
    }
}
