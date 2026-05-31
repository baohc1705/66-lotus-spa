using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore.Storage;
using System.Data;

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
            var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
            return transaction.GetDbTransaction();
        }
    }
}
