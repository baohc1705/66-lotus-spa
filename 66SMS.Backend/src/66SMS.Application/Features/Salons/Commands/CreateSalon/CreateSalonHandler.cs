using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.Features.Salons.Commands.CreateSalon
{
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
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                bool codeExists = salonSqlRepository.AsQueryable()
                    .IgnoreQueryFilters()
                    .Any(x => x.Code == request.Code);
                if (codeExists)
                    return Result<object>.Failure(409, SalonConst.MSG_CODE_EXISTED);

                Salon salon = mapper.Map<Salon>(request);
                salon.CreatedAt = DateTimeHelper.UtcNow();
                salon.CreatedBy = request.CreatedBy ?? 1;
                salon.Status = request.Status ?? SalonConst.STATUS_ACTIVE;

                salonSqlRepository.Add(salon);
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
