using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Models;
using _66SMS.Persistence.Repositories.Sql.Base;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class PayrollSqlRepository : GenericSqlRepository<Payroll, int>, IPayrollSqlRepository
    {
        private const string SpGetCommissionStats = "dbo.usp_GetPayrollCommissionStats";
        private const string SpGetCommissionDailyStats = "dbo.usp_GetPayrollCommissionDailyStats";

        private readonly ApplicationDbContext dbContext;

        public PayrollSqlRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<IReadOnlyList<PayrollCommissionStatRowDto>> GetCommissionStatsAsync(
            int staffId,
            DateOnly fromDate,
            DateOnly toDate,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<PayrollCommissionStatRowDto>(
                SpGetCommissionStats,
                cancellationToken,
                staffId,
                fromDate,
                toDate);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<PayrollCommissionDailyRowDto>> GetCommissionDailyStatsAsync(
            int staffId,
            DateOnly fromDate,
            DateOnly toDate,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<PayrollCommissionDailyRowDto>(
                SpGetCommissionDailyStats,
                cancellationToken,
                staffId,
                fromDate,
                toDate);

            return rows.ToList();
        }
    }
}
