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

        public CreateSalonHandler(ISalonSqlRepository salonSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.salonSqlRepository = salonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(CreateSalonCommand request, CancellationToken cancellationToken)
        {
            // check if code existed
            bool codeExists = salonSqlRepository
                .AsQueryable()
                .Where(x => x.Code == request.Code)
                .Any();

            if (codeExists)
                return Result<object>.Conflict(SalonConst.MSG_CODE_EXISTED, ErrorCodes.ERR_SALON_CODE_EXISTED);

            // map request to domain entity
            Salon salon = mapper.Map<Salon>(request);

            // begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // save and persist to database
                salonSqlRepository.Add(salon);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // commit transaction
                transaction.Commit();

                // return success result
                return Result<object>.Created(salon.Id);
            }
            catch
            {
                // rollback transaction
                transaction.Rollback();
                throw;
            }
        }
    }
}
