using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Models;

namespace _66SMS.Domain.Abstractions.Repositories.Sql
{
    public interface IPayrollSqlRepository : IGenericSqlRepository<Payroll, int>
    {
        Task<IReadOnlyList<PayrollCommissionStatRowDto>> GetCommissionStatsAsync(
            int staffId,
            DateOnly fromDate,
            DateOnly toDate,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<PayrollCommissionDailyRowDto>> GetCommissionDailyStatsAsync(
            int staffId,
            DateOnly fromDate,
            DateOnly toDate,
            CancellationToken cancellationToken = default);
    }
}
