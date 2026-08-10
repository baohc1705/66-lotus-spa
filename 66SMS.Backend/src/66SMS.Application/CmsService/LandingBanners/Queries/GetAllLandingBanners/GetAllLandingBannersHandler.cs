using _66SMS.Application.DTOs;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.CmsService.LandingBanners.Queries.GetAllLandingBanners
{
    public class GetAllLandingBannersHandler : IRequestHandler<GetAllLandingBannersQuery, Result<PagedResult<LandingBannerDto>>>
    {
        private readonly ILandingBannerSqlRepository landingBannerSqlRepository;

        public GetAllLandingBannersHandler(ILandingBannerSqlRepository landingBannerSqlRepository)
        {
            this.landingBannerSqlRepository = landingBannerSqlRepository;
        }

        public async Task<Result<PagedResult<LandingBannerDto>>> Handle(GetAllLandingBannersQuery request, CancellationToken cancellationToken)
        {
            var query = landingBannerSqlRepository.AsQueryable();

            if (!request.IsDeleted)
                query = query.Where(x => x.Status != LandingBannerConst.STATUS_DELETED);

            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            if (!string.IsNullOrEmpty(request.Filter))
            {
                string keyword = request.Filter.ToLower();
                query = query.Where(x =>
                    x.Title.ToLower().Contains(keyword)
                    || (x.BrandLabel != null && x.BrandLabel.ToLower().Contains(keyword))
                    || (x.Subtitle != null && x.Subtitle.ToLower().Contains(keyword)));
            }

            query = request.OrderBy?.ToLower() switch
            {
                "title" => request.IsDescending ? query.OrderByDescending(x => x.Title) : query.OrderBy(x => x.Title),
                "createdat" => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
                _ => request.IsDescending
                    ? query.OrderByDescending(x => x.SortOrder).ThenByDescending(x => x.Id)
                    : query.OrderBy(x => x.SortOrder).ThenBy(x => x.Id)
            };

            PagedResult<LandingBannerDto> result = await query
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
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<LandingBannerDto>>.Success(result);
        }
    }
}
