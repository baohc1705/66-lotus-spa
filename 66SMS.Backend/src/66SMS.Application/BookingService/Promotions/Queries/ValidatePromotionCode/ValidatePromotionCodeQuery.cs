using _66SMS.Application.DTOs.Promotions;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Promotions.Queries.ValidatePromotionCode
{
    public class ValidatePromotionCodeQuery : IRequest<Result<PromotionValidationDto>>
    {
        public string Code { get; set; } = null!;
        public decimal OrderTotal { get; set; }
    }
}
