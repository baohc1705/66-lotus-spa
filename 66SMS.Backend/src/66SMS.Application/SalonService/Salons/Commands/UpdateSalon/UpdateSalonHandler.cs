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

namespace _66SMS.Application.SalonService.Salons.Commands.UpdateSalon
{
    public class UpdateSalonHandler : IRequestHandler<UpdateSalonCommand, Result<object>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;

        public UpdateSalonHandler(
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

        public async Task<Result<object>> Handle(UpdateSalonCommand request, CancellationToken cancellationToken)
        {
            Salon? salon = await salonSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
            if (salon == null)
                return Result<object>.NotFound(SalonConst.MSG_SALON_NOT_FOUND, ErrorCodes.ERR_SALON_NOT_FOUND);

            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                request.ImageUrl = null;

            mapper.Map(request, salon);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    salon.ImageUrl = await imageUploadService.UploadAsync(request.ImageBase64, SalonConst.GenerateImageFileName(salon.Id), SalonConst.IMAGE_FOLDER, cancellationToken);
                }

                salonSqlRepository.Update(salon);
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
