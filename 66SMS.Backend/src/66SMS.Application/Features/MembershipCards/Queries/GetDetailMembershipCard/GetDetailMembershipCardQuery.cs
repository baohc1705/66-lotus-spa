using _66SMS.Application.DTOs.MembershipCards;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.MembershipCards.Queries.GetDetailMembershipCard
{
    public class GetDetailMembershipCardQuery : IRequest<Result<MembershipCardDto>>
    {
        public int Id { get; set; }
    }
}
