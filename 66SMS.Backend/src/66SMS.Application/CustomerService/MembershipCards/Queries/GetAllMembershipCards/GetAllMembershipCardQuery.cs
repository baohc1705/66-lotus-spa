using _66SMS.Application.DTOs.MembershipCards;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CustomerService.MembershipCards.Queries.GetAllMembershipCards
{
    /// <summary>
    ///  Get all membership card request
    /// </summary>
    public class GetAllMembershipCardQuery : PageRequest, IRequest<Result<PagedResult<MembershipCardDto>>>
    {
        public int? CustomerId { get; set; }
        public int? MembershipTierId { get; set; }
        public int? Status { get; set; }
    }
}
