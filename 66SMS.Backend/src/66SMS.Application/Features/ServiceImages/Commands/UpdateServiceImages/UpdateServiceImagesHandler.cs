using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.ServiceImages.Commands.UpdateServiceImages
{
    public class UpdateServiceImagesHandler : IRequestHandler<UpdateServiceImagesCommand, Result<object>>
    {
        private readonly IServiceImageSqlRepository serviceImageSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateServiceImagesHandler(IServiceImageSqlRepository serviceImageSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.serviceImageSqlRepository = serviceImageSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateServiceImagesCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                ServiceImage? entity = await serviceImageSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);
                if (entity == null)
                {
                    return Result<object>.NotFound(ServiceImageConst.MSG_SERVICE_IMAGE_NOT_FOUND, ErrorCodes.ERR_SERVICE_IMAGE_NOT_FOUND);
                }

                mapper.Map(request, entity);

                serviceImageSqlRepository.Update(entity);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<object>.Success(new { entity.Id });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return Result<object>.Failure(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}
