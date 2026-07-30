using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CmsService.LandingBanners.Commands.UpdateLandingBanner
{
    public class UpdateLandingBannerHandler : IRequestHandler<UpdateLandingBannerCommand, Result<object>>
    {
        private readonly ILandingBannerSqlRepository landingBannerSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;

        public UpdateLandingBannerHandler(
            ILandingBannerSqlRepository landingBannerSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService)
        {
            this.landingBannerSqlRepository = landingBannerSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
        }

        public async Task<Result<object>> Handle(UpdateLandingBannerCommand request, CancellationToken cancellationToken)
        {
            LandingBanner? banner = await landingBannerSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
            if (banner == null || banner.Status == LandingBannerConst.STATUS_DELETED)
                return Result<object>.NotFound(LandingBannerConst.MSG_NOT_FOUND, ErrorCodes.ERR_LANDING_BANNER_NOT_FOUND);

            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                request.ImageUrl = null;

            mapper.Map(request, banner);
            banner.UpdatedAt = DateTimeHelper.UtcNow();

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    banner.ImageUrl = await imageUploadService.UploadAsync(
                        request.ImageBase64,
                        LandingBannerConst.GenerateImageFileName(banner.Id),
                        LandingBannerConst.IMAGE_FOLDER,
                        cancellationToken);
                }

                landingBannerSqlRepository.Update(banner);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
