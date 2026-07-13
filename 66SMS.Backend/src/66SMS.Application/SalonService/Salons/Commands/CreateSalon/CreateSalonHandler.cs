using _66SMS.Contract.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
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

        public CreateSalonHandler(
            ISalonSqlRepository salonSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService)
        {
            this.salonSqlRepository = salonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
        }

        public async Task<Result<object>> Handle(CreateSalonCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                request.ImageUrl = null;

            Salon salon = mapper.Map<Salon>(request);
            salon.Code = string.Empty;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                salonSqlRepository.Add(salon);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    salon.ImageUrl = await imageUploadService.UploadAsync(request.ImageBase64, SalonConst.GenerateImageFileName(salon.Id), SalonConst.IMAGE_FOLDER, cancellationToken);
                }
                salon.Code = $"CN{salon.Id:D3}";
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<object>.Created(salon.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
