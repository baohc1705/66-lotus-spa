using _66SMS.Application.DTOs.Promotions;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Promotions.Queries.GetAllPromotions
{
    public class GetAllPromotionsQuery : PageRequest, IRequest<Result<PagedResult<PromotionDto>>>
    {
        public int? Status { get; set; }
        public string? Keyword { get; set; }
    }
}
