using _66SMS.Application.DTOs.MembershipCards;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Users.Queries.GetMyMembershipCard
{
    public class GetMyMembershipCardQuery : IRequest<Result<MembershipCardDto>>
    {
        public int UserId { get; set; }
    }
}
