using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.SalonService.Salons.Commands.CreateSalon
{
    /// <summary>
    /// Handler for <see cref="CreateSalonCommand"/>
    /// </summary>
    public class CreateSalonHandler : IRequestHandler<CreateSalonCommand, Result<object>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;
        private readonly ICacheService cacheService;

        public CreateSalonHandler(
            ISalonSqlRepository salonSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService,
            ICacheService cacheService)
        {
            this.salonSqlRepository = salonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(CreateSalonCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                request.ImageUrl = null;

            Salon salon = mapper.Map<Salon>(request);
            salon.Code = string.Empty;

            if (request.IsPrimary != true)
                salon.IsPrimary = null;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (salon.IsPrimary == true)
                    await ClearOtherPrimarySalonsAsync(null, cancellationToken);

                salonSqlRepository.Add(salon);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    salon.ImageUrl = await imageUploadService.UploadAsync(request.ImageBase64, SalonConst.GenerateImageFileName(salon.Id), SalonConst.IMAGE_FOLDER, cancellationToken);
                }
                salon.Code = $"CN{salon.Id:D3}";
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                await cacheService.RemoveAsync(SalonConst.CacheKeyDetail(salon.Id), cancellationToken);
                await cacheService.RemoveByPrefixAsync(SalonConst.CACHE_PREFIX, cancellationToken);

                return Result<object>.Created(salon.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        private async Task ClearOtherPrimarySalonsAsync(int? excludeId, CancellationToken cancellationToken)
        {
            var others = await salonSqlRepository.AsQueryable(false)
                .Where(x => x.IsPrimary == true && (excludeId == null || x.Id != excludeId.Value))
                .ToListAsync(cancellationToken);

            foreach (var other in others)
            {
                other.IsPrimary = null;
                salonSqlRepository.Update(other);
            }
        }
    }
}
