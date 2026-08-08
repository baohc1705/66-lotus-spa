using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.SalonService.Salons.Commands.UpdateSalon
{
    public class UpdateSalonHandler : IRequestHandler<UpdateSalonCommand, Result<object>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;
        private readonly ICacheService cacheService;

        public UpdateSalonHandler(
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

        public async Task<Result<object>> Handle(UpdateSalonCommand request, CancellationToken cancellationToken)
        {
            Salon? salon = await salonSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
            if (salon == null)
                return Result<object>.NotFound(SalonConst.MSG_SALON_NOT_FOUND, ErrorCodes.ERR_SALON_NOT_FOUND);

            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                request.ImageUrl = null;

            mapper.Map(request, salon);

            if (request.IsPrimary == false)
                salon.IsPrimary = null;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (salon.IsPrimary == true)
                    await ClearOtherPrimarySalonsAsync(salon.Id, cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    salon.ImageUrl = await imageUploadService.UploadAsync(request.ImageBase64, SalonConst.GenerateImageFileName(salon.Id), SalonConst.IMAGE_FOLDER, cancellationToken);
                }

                salonSqlRepository.Update(salon);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                await cacheService.RemoveAsync(SalonConst.CacheKeyDetail(salon.Id), cancellationToken);
                await cacheService.RemoveByPrefixAsync(SalonConst.CACHE_PREFIX, cancellationToken);

                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        private async Task ClearOtherPrimarySalonsAsync(int excludeId, CancellationToken cancellationToken)
        {
            var others = await salonSqlRepository.AsQueryable(false)
                .Where(x => x.IsPrimary == true && x.Id != excludeId)
                .ToListAsync(cancellationToken);

            foreach (var other in others)
            {
                other.IsPrimary = null;
                salonSqlRepository.Update(other);
            }
        }
    }
}
