using _66SMS.Application.DTOs.Promotions;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Promotions.Queries.GetActivePromotions
{
    public class GetActivePromotionsQuery : IRequest<Result<IReadOnlyList<ActivePromotionDto>>>
    {
    }
}
