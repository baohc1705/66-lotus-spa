using _66SMS.Application.DTOs.LandingBanners;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CmsService.LandingBanners.Queries.GetDetailLandingBanner
{
    public class GetDetailLandingBannerQuery : IRequest<Result<LandingBannerDto>>
    {
        public int? Id { get; set; }
    }
}
