using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CmsService.LandingBanners.Commands.DeleteLandingBanner
{
    public class DeleteLandingBannerCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
    }
}
