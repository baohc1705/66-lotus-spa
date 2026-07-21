using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;

namespace _66SMS.Domain.Abstractions.Repositories.Sql
{
    public interface IPayrollSqlRepository : IGenericSqlRepository<Payroll, int>
    {
        Task<IReadOnlyList<PayrollCommissionStatRowDto>> GetCommissionStatsAsync(
            int staffId,
            DateOnly fromDate,
            DateOnly toDate,
            CancellationToken cancellationToken = default);
    }
}
