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

namespace _66SMS.Application.SalonService.StaffSalons.Commands.CreateStaffSalon
{
    /// <summary>
    /// Handler for <see cref="CreateStaffSalonCommand"/>
    /// </summary>
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
        /// <summary>
        /// Handle the command to create a new staff salon
        /// </summary>
        /// <param name="request">The command to create a new staff salon</param>
        /// <param name="cancellationToken">The cancellation token</param>
        /// <returns>The result of the command</returns>
        public async Task<Result<object>> Handle(CreateStaffSalonCommand request, CancellationToken cancellationToken)
        {
            /// Find the staff by id
            Staff? staff = await staffSqlRepository.FindByIdAsync((int)request.StaffId!);
            if (staff == null)
                return Result<object>.NotFound(StaffSalonConst.MSG_STAFF_SALON_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            /// Find the salon by id
            Salon? salon = await salonSqlRepository.FindByIdAsync((int)request.SalonId!);
            if (salon == null)
                return Result<object>.NotFound(StaffSalonConst.MSG_STAFF_SALON_SALON_NOT_FOUND, ErrorCodes.ERR_SALON_NOT_FOUND);

            // Get all active staff salons for the staff
            var activeStaffSalons = await staffSalonSqlRepository
                .AsQueryable(false)
                .Where(x => x.StaffId == request.StaffId && x.Status == (int)StatusActiveEnum.ACTIVED)
                .ToListAsync(cancellationToken); 

            // If there are active staff salons for the staff, set the status to deleted and set the end date to the current date
            if (activeStaffSalons.Count > 0)
            {
                foreach (var item in activeStaffSalons)
                {
                    item.Status = (int)StatusActiveEnum.IACTIVED;
                    item.EndDate = DateTimeHelper.UtcNow().ToDateOnly();
                }
            }

            // Create the staff salon
            StaffSalon staffSalon = mapper.Map<StaffSalon>(request);

            // Begin the transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Add the staff salon to the database
                staffSalonSqlRepository.Add(staffSalon);

                // Save the changes to the database
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Commit the transaction
                transaction.Commit();

                // Remove the cache for the salon
                await cacheService.RemoveAsync(StaffConst.CacheKeyBySalon((int)request.SalonId!), cancellationToken);

                // Return the result of the command
                return Result<object>.Created(staffSalon.Id);
            }
            catch
            {
                // Rollback the transaction
                transaction.Rollback();
                throw;
            }
        }
    }
}
