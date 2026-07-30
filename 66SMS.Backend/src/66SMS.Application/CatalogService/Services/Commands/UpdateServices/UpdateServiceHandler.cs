using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.CatalogService.Services.Commands.UpdateServices
{
    /// <summary>
    /// Handler for <see cref="UpdateServiceCommand"/>
    /// </summary>
    public class UpdateServiceHandler : IRequestHandler<UpdateServiceCommand, Result<object>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly IServiceProductSqlRepository serviceProductSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;
        private readonly ICacheService cacheService;

        public UpdateServiceHandler(
            IServiceSqlRepository serviceSqlRepository,
            IServiceProductSqlRepository serviceProductSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService,
            ICacheService cacheService)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.serviceProductSqlRepository = serviceProductSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
        {
            Service? service = await serviceSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
            if (service == null)
            {
                return Result<object>.NotFound(ServiceConst.MSG_SERVICE_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);
            }

            mapper.Map(request, service);
            service.UpdatedAt = DateTimeHelper.UtcNow();

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (!string.IsNullOrWhiteSpace(request.ImageUrl))
                {
                    service.ImageUrl = await imageUploadService.UploadAsync(
                        request.ImageUrl,
                        ServiceConst.GenerateImageFileName(service.Id),
                        ServiceConst.IMAGE_FOLDER,
                        cancellationToken);
                }

                if (request.ServiceProducts != null && request.ServiceProducts.Count > 0)
                {
                    await SyncServiceProductsAsync(service.Id, request.ServiceProducts, cancellationToken);
                }

                serviceSqlRepository.Update(service);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                await cacheService.RemoveAsync(ServiceConst.CacheKeyDetail(service.Id), cancellationToken);
                await cacheService.RemoveByPrefixAsync(ServiceConst.CACHE_PREFIX, cancellationToken);

                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        /// <summary>
        /// Có rồi thì cập nhật, chưa có thì thêm mới. Product không còn trong list thì xóa.
        /// </summary>
        private async Task SyncServiceProductsAsync(
            int serviceId,
            List<CreateServices.ServiceProductItems> items,
            CancellationToken cancellationToken)
        {
            var desired = items
                .Where(x => x.ProductId.HasValue && x.ProductId > 0)
                .GroupBy(x => x.ProductId!.Value)
                .Select(g => g.Last())
                .ToList();

            var existing = await serviceProductSqlRepository
                .AsQueryable(false)
                .Where(x => x.ServiceId == serviceId)
                .ToListAsync(cancellationToken);

            var desiredProductIds = desired.Select(x => x.ProductId!.Value).ToHashSet();
            var now = DateTimeHelper.UtcNow();

            var toRemove = existing.Where(x => !desiredProductIds.Contains(x.ProductId)).ToList();
            if (toRemove.Count > 0)
            {
                serviceProductSqlRepository.RemoveRange(toRemove);
            }

            foreach (var item in desired)
            {
                var productId = item.ProductId!.Value;
                var found = existing.FirstOrDefault(x => x.ProductId == productId);
                if (found != null)
                {
                    found.QuantityUsed = item.QuantityUsed ?? 1;
                    found.Note = item.Note;
                    found.Status = item.Status ?? (int)StatusActiveEnum.ACTIVED;
                    found.UpdatedAt = now;
                    serviceProductSqlRepository.Update(found);
                }
                else
                {
                    serviceProductSqlRepository.Add(new ServiceProduct
                    {
                        ServiceId = serviceId,
                        ProductId = productId,
                        QuantityUsed = item.QuantityUsed ?? 1,
                        Note = item.Note,
                        Status = item.Status ?? (int)StatusActiveEnum.ACTIVED,
                        CreatedAt = now,
                    });
                }
            }
        }
    }
}
