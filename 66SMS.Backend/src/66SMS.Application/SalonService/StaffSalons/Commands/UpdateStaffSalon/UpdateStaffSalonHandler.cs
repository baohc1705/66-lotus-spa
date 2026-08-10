using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.SalonService.StaffSalons.Commands.UpdateStaffSalon
{
    public class UpdateStaffSalonHandler : IRequestHandler<UpdateStaffSalonCommand, Result<object>>
    {
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly ICacheService cacheService;

        public UpdateStaffSalonHandler(
            IStaffSalonSqlRepository staffSalonSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            ICacheService cacheService)
        {
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(UpdateStaffSalonCommand request, CancellationToken cancellationToken)
        {
            StaffSalon? staffSalon = await staffSalonSqlRepository.FindByIdAsync((int)request.Id!);
            if (staffSalon == null)
                return Result<object>.NotFound(StaffSalonConst.MSG_STAFF_SALON_NOT_FOUND, ErrorCodes.ERR_STAFF_SALON_NOT_FOUND);

            var salonId = staffSalon.SalonId;

            mapper.Map(request, staffSalon);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                staffSalonSqlRepository.Update(staffSalon);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                await cacheService.RemoveAsync(StaffConst.CacheKeyBySalon(salonId), cancellationToken);
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
