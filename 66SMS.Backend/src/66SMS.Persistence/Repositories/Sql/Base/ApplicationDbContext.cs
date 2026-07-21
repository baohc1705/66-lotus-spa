using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace _66SMS.Persistence.Repositories.Sql.Base
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }

        public async Task<IEnumerable<T>> ExecuteStoredProcedureAsync<T>(
            string storedProcedureName,
            CancellationToken cancellationToken = default,
            params object[] parameters)
        {
            var sql = BuildStoredProcedureSql(storedProcedureName, parameters);
            return await Database.SqlQueryRaw<T>(sql, parameters).ToListAsync(cancellationToken);
        }

        public async Task<int> ExecuteNonQueryStoredProcedureAsync(
            string storedProcedureName,
            CancellationToken cancellationToken = default,
            params object[] parameters)
        {
            var sql = BuildStoredProcedureSql(storedProcedureName, parameters);
            return await Database.ExecuteSqlRawAsync(sql, cancellationToken, parameters);
        }

        private static string BuildStoredProcedureSql(string storedProcedureName, object[] parameters)
        {
            if (string.IsNullOrWhiteSpace(storedProcedureName))
                throw new ArgumentException("Stored procedure name cannot be null or empty.", nameof(storedProcedureName));

            var parameterPlaceholders = parameters.Length > 0
                ? string.Join(", ", Enumerable.Range(0, parameters.Length).Select(i => $"@p{i}"))
                : string.Empty;

            return $"EXEC {storedProcedureName} {parameterPlaceholders}";
        }
    }
}
