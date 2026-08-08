using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CmsService.LandingBanners.Queries.GetAllLandingBanners
{
    public class GetAllLandingBannersQuery : PageRequest, IRequest<Result<PagedResult<LandingBannerDto>>>
    {
        public int? Status { get; set; }
        public bool IsDeleted { get; set; } = true;
    }
}
