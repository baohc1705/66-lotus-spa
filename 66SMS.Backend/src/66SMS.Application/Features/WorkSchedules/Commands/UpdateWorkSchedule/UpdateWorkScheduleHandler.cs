using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.WorkSchedules.Commands.UpdateWorkSchedule
{
    public class UpdateWorkScheduleHandler : IRequestHandler<UpdateWorkScheduleCommand, Result<object>>
    {
        private readonly IWorkScheduleSqlRepository workScheduleSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        public UpdateWorkScheduleHandler(IWorkScheduleSqlRepository workScheduleSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.workScheduleSqlRepository = workScheduleSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateWorkScheduleCommand request, CancellationToken cancellationToken)
        {
            WorkSchedule workSchedule = await workScheduleSqlRepository.GetByIdAsync((int)request.Id, false, cancellationToken);
            mapper.Map(request, workSchedule);
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                workScheduleSqlRepository.Update(workSchedule);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback(); throw;
            }
        }
    }
}
