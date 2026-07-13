using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using MediatR;
using System.Data;
using _66SMS.Contract.Abstractions;

namespace _66SMS.Application.CatalogService.Services.Commands.DeleteServices
{
    /// <summary>
    /// Handler for <see cref="DeleteServiceCommand"/>
    /// </summary>
    public class DeleteServiceHandler : IRequestHandler<DeleteServiceCommand, Result<object>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IImageUploadService imageUploadService;

        public DeleteServiceHandler(IServiceSqlRepository serviceSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IImageUploadService imageUploadService)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.imageUploadService = imageUploadService;
        }

        public async Task<Result<object>> Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
        {
            // Find service by id and tracking
            Service? service = await serviceSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);

            // Return not found if service is null
            if (service == null)
            {
                return Result<object>.NotFound(ServiceConst.MSG_SERVICE_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);
            }

            // Update status is deleted
            service.Status = (int)StatusActiveEnum.DELETED;
            // Begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Update and persist to database
                serviceSqlRepository.Update(service);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // commit transaction
                transaction.Commit();

                // Return success result
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
