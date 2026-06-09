using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.WorkSchedules.Commands.CreateWorkSchedule
{
    public class CreateWorkScheduleHandler : IRequestHandler<CreateWorkScheduleCommand, Result<object>>
    {
        private readonly IWorkScheduleSqlRepository workScheduleSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        public CreateWorkScheduleHandler(IWorkScheduleSqlRepository workScheduleSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.workScheduleSqlRepository = workScheduleSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(CreateWorkScheduleCommand request, CancellationToken cancellationToken)
        {
            WorkSchedule? workSchedule = mapper.Map<WorkSchedule>(request);
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                workScheduleSqlRepository.Add(workSchedule);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<object>.Created(workSchedule.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
