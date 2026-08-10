using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CustomerService.MembershipTiers.Queries.GetDetailMembershipTier
{
    public class GetDetailMembershipTierQuery : IRequest<Result<MembershipTierDto>>
    {
        public int Id { get; set; }
    }
}
