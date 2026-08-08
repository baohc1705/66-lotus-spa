using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.BookingService.Promotions.Commands.DeletePromotion
{
    public class DeletePromotionCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
