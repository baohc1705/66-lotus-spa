using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Promotions.Queries.GetDetailPromotion
{
    public class GetDetailPromotionQuery : IRequest<Result<PromotionDto>>
    {
        public int Id { get; set; }
    }
}
