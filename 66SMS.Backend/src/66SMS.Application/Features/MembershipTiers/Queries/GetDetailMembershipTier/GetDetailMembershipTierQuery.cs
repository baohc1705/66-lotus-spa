using _66SMS.Application.DTOs.MembershipTiers;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.MembershipTiers.Queries.GetDetailMembershipTier
{
    public class GetDetailMembershipTierQuery : IRequest<Result<MembershipTierDto>>
    {
        public int Id { get; set; }
    }
}
