using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.CmsService.LandingBanners.Commands.DeleteLandingBanner
{
    public class DeleteLandingBannerHandler : IRequestHandler<DeleteLandingBannerCommand, Result<object>>
    {
        private readonly ILandingBannerSqlRepository landingBannerSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteLandingBannerHandler(
            ILandingBannerSqlRepository landingBannerSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.landingBannerSqlRepository = landingBannerSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteLandingBannerCommand request, CancellationToken cancellationToken)
        {
            LandingBanner? banner = await landingBannerSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
            if (banner == null || banner.Status == LandingBannerConst.STATUS_DELETED)
                return Result<object>.NotFound(LandingBannerConst.MSG_NOT_FOUND, ErrorCodes.ERR_LANDING_BANNER_NOT_FOUND);

            banner.Status = LandingBannerConst.STATUS_DELETED;
            banner.UpdatedAt = DateTimeHelper.UtcNow();

            landingBannerSqlRepository.Update(banner);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
