using _66SMS.Application.DTOs.LandingBanners;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CmsService.LandingBanners.Queries.GetDetailLandingBanner
{
    public class GetDetailLandingBannerHandler : IRequestHandler<GetDetailLandingBannerQuery, Result<LandingBannerDto>>
    {
        private readonly ILandingBannerSqlRepository landingBannerSqlRepository;

        public GetDetailLandingBannerHandler(ILandingBannerSqlRepository landingBannerSqlRepository)
        {
            this.landingBannerSqlRepository = landingBannerSqlRepository;
        }

        public async Task<Result<LandingBannerDto>> Handle(GetDetailLandingBannerQuery request, CancellationToken cancellationToken)
        {
            LandingBannerDto? banner = await landingBannerSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id && x.Status != LandingBannerConst.STATUS_DELETED)
                .Select(x => new LandingBannerDto
                {
                    Id = x.Id,
                    Title = x.Title,
                    Subtitle = x.Subtitle,
                    BrandLabel = x.BrandLabel,
                    ImageUrl = x.ImageUrl,
                    CtaPrimaryText = x.CtaPrimaryText,
                    CtaPrimaryHref = x.CtaPrimaryHref,
                    CtaSecondaryText = x.CtaSecondaryText,
                    CtaSecondaryHref = x.CtaSecondaryHref,
                    SortOrder = x.SortOrder,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (banner == null)
                return Result<LandingBannerDto>.NotFound(LandingBannerConst.MSG_NOT_FOUND, ErrorCodes.ERR_LANDING_BANNER_NOT_FOUND);

            return Result<LandingBannerDto>.Success(banner);
        }
    }
}
