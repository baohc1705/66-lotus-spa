using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Data;
using System.Data.Common;

namespace _66SMS.Persistence.Repositories.Sql.Base
{
    public class SqlUnitOfWork : ISqlUnitOfWork
    {
        private readonly ApplicationDbContext context;

        public SqlUnitOfWork(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<int> SaveChangeAsync(CancellationToken cancellationToken = default)
        {
            return await context.SaveChangesAsync(cancellationToken);
        }

        public async Task<IDbTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            return await BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);
        }

        public async Task<IDbTransaction> BeginTransactionAsync(IsolationLevel isolationLevel, CancellationToken cancellationToken = default)
        {
            var connection = context.Database.GetDbConnection();
            if (connection.State != ConnectionState.Open)
                await context.Database.OpenConnectionAsync(cancellationToken);

            var dbTransaction = await connection.BeginTransactionAsync(isolationLevel, cancellationToken);
            await context.Database.UseTransactionAsync(dbTransaction, cancellationToken);
            return dbTransaction;
        }
    }
}
