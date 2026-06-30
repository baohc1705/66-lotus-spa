using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Promotions.Commands.DeletePromotion
{
    public class DeletePromotionCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
