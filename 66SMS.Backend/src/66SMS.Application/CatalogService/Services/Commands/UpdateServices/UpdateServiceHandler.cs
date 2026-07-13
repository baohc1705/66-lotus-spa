using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;
using _66SMS.Contract.Abstractions;

namespace _66SMS.Application.CatalogService.Services.Commands.UpdateServices
{
    /// <summary>
    /// Handler for <see cref="UpdateServiceCommand"/>
    /// </summary>
    public class UpdateServiceHandler : IRequestHandler<UpdateServiceCommand, Result<object>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;

        public UpdateServiceHandler(
            IServiceSqlRepository serviceSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
        }

        public async Task<Result<object>> Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
        {
            // Find service by id
            Service? service = await serviceSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
            if (service == null)
            {
                return Result<object>.NotFound(ServiceConst.MSG_SERVICE_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);
            }

            // map request to domain entity, ignore null
            mapper.Map(request, service);

            // Begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Upload image for service if request provived
                if (!string.IsNullOrWhiteSpace(request.ImageUrl))
                {
                    service.ImageUrl = await imageUploadService.UploadAsync(request.ImageUrl, ServiceConst.GenerateImageFileName(service.Id), ServiceConst.IMAGE_FOLDER, cancellationToken);
                }
                
                // update and persist to database
                serviceSqlRepository.Update(service);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // commit transaction
                transaction.Commit();

                // return success result
                return Result<object>.Ok();
            }
            catch
            {
                // rollback transaction on failure
                transaction.Rollback();
                throw;
            }
        }
    }
}
