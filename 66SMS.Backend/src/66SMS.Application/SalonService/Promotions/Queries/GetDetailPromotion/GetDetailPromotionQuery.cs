using _66SMS.Application.DTOs.Promotions;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Promotions.Queries.GetDetailPromotion
{
    public class GetDetailPromotionQuery : IRequest<Result<PromotionDto>>
    {
        public int Id { get; set; }
    }
}
