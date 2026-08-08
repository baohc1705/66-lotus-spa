using _66SMS.Application.DTOs.MembershipCards;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CustomerService.MembershipCards.Queries.GetDetailMembershipCard
{
    public class GetDetailMembershipCardQuery : IRequest<Result<MembershipCardDto>>
    {
        public int? Id { get; set; }
        public int? CustomerId { get; set; }
        public int? UserId { get; set; }
    }
}
