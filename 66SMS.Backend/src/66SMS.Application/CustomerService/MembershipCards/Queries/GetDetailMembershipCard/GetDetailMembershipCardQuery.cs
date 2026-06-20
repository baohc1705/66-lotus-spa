using _66SMS.Application.DTOs.MembershipCards;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CustomerService.MembershipCards.Queries.GetDetailMembershipCard
{
    public class GetDetailMembershipCardQuery : IRequest<Result<MembershipCardDto>>
    {
        public int Id { get; set; }
    }
}
