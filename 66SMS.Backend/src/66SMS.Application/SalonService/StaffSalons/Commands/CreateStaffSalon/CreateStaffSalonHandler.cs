using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.SalonService.StaffSalons.Commands.CreateStaffSalon
{
    public class CreateStaffSalonHandler : IRequestHandler<CreateStaffSalonCommand, Result<object>>
    {
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly ICacheService cacheService;

        public CreateStaffSalonHandler(
            IStaffSalonSqlRepository staffSalonSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ISalonSqlRepository salonSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            ICacheService cacheService)
        {
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.salonSqlRepository = salonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.cacheService = cacheService;
        }
        public async Task<Result<object>> Handle(CreateStaffSalonCommand request, CancellationToken cancellationToken)
        {
            Staff? staff = await staffSqlRepository.FindByIdAsync((int)request.StaffId!);
            if (staff == null)
                return Result<object>.NotFound(StaffSalonConst.MSG_STAFF_SALON_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            Salon? salon = await salonSqlRepository.FindByIdAsync((int)request.SalonId!);
            if (salon == null)
                return Result<object>.NotFound(StaffSalonConst.MSG_STAFF_SALON_SALON_NOT_FOUND, ErrorCodes.ERR_SALON_NOT_FOUND);

            var activeStaffSalons = await staffSalonSqlRepository
                .AsQueryable(false)
                .Where(x => x.StaffId == request.StaffId && x.Status == (int)StatusActiveEnum.ACTIVED)
                .ToListAsync(cancellationToken); 

            if (activeStaffSalons.Count > 0)
            {
                foreach (var item in activeStaffSalons)
                {
                    item.Status = (int)StatusActiveEnum.IACTIVED;
                    item.EndDate = DateTimeHelper.UtcNow().ToDateOnly();
                }
            }

            StaffSalon staffSalon = mapper.Map<StaffSalon>(request);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                staffSalonSqlRepository.Add(staffSalon);

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                await cacheService.RemoveAsync(StaffConst.CacheKeyBySalon((int)request.SalonId!), cancellationToken);

                return Result<object>.Created(staffSalon.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
