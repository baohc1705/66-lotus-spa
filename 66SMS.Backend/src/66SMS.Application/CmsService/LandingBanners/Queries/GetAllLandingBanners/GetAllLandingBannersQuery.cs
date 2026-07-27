using _66SMS.Application.DTOs.LandingBanners;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CmsService.LandingBanners.Queries.GetAllLandingBanners
{
    public class GetAllLandingBannersQuery : PageRequest, IRequest<Result<PagedResult<LandingBannerDto>>>
    {
        public int? Status { get; set; }
        public bool IsDeleted { get; set; } = true;
    }
}
