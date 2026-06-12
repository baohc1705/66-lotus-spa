using _66SMS.Contracts.Exceptions;
using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class WorkScheduleSqlRepository : GenericSqlRepository<WorkSchedule, int>, IWorkScheduleSqlRepository
    {
        public WorkScheduleSqlRepository(ApplicationDbContext context) : base(context)
        {
        }

        public void Add(WorkSchedule entity)
        {
            entity.CreatedAt = DateTimeHelper.UtcNow();
            base.Add(entity);
        }

        public void AddRange(List<WorkSchedule> entities)
        {
            foreach (var entity in entities)
                entity.CreatedAt = DateTimeHelper.UtcNow();
            base.AddRange(entities);
        }
        public void Update(WorkSchedule entity)
        {
            entity.UpdatedAt = DateTimeHelper.UtcNow();
            base.Update(entity);
        }

        public async Task<WorkSchedule?> FindByIdAsync(int id, bool asNoTracking = true, CancellationToken cancellationToken = default)
        {
            WorkSchedule? workSchedule = await base.FindByIdAsync(id, asNoTracking, cancellationToken);
            if (workSchedule == null)
                throw GlobalException.NotFound("User not found id");
            return workSchedule;
        }
    }
}
