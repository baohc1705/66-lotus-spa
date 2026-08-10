using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CmsService.LandingBanners.Commands.CreateLandingBanner
{
    public class CreateLandingBannerHandler : IRequestHandler<CreateLandingBannerCommand, Result<object>>
    {
        private readonly ILandingBannerSqlRepository landingBannerSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;

        public CreateLandingBannerHandler(
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

        public async Task<Result<object>> Handle(CreateLandingBannerCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                request.ImageUrl = null;

            LandingBanner banner = mapper.Map<LandingBanner>(request);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                landingBannerSqlRepository.Add(banner);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    banner.ImageUrl = await imageUploadService.UploadAsync(
                        request.ImageBase64,
                        LandingBannerConst.GenerateImageFileName(banner.Id),
                        LandingBannerConst.IMAGE_FOLDER,
                        cancellationToken);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }

                transaction.Commit();
                return Result<object>.Created(banner.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
