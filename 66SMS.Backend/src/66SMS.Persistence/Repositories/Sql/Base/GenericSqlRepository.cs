using _66SMS.Contracts.Abstractions;
using _66SMS.Domain.Abstractions.Entities;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Data;
using System.Data.Common;
using System.Linq.Expressions;

namespace _66SMS.Persistence.Repositories.Sql.Base
{
    public class GenericSqlRepository<TEntity, TKey> : IGenericSqlRepository<TEntity, TKey> where TEntity : EntityAuditTable<TKey>
    {
        private readonly ApplicationDbContext context;
        private DbSet<TEntity>? entities;
        public GenericSqlRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        protected DbSet<TEntity> Entities
        {
            get
            {
                if (entities == null)
                    entities = context.Set<TEntity>();
                return entities;
            }
        }
        public IQuery<TEntity> Query(bool asNoTracking = true, bool isDeleted = false)
        {
            var query = Entities.AsQueryable();
            if (asNoTracking)
                query = query.AsNoTracking();
            if (!isDeleted)
                query = query.Where(x => !x.IsDeleted);
            return new EntityQuery<TEntity>(query);
        }
        public async Task<TEntity?> GetByIdAsync(TKey id, bool asNoTracking = true, bool isDeleted = true, CancellationToken cancellationToken = default)
        {
            var query = Entities.AsQueryable();
            if (asNoTracking)
                query = query.AsNoTracking();
            if (!isDeleted)
                query = query.Where(x => !x.IsDeleted);
            query = query.Where(x => x.Id.Equals(id));
            return await query.FirstOrDefaultAsync(cancellationToken);
        }

        public Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default)
        {
            return Entities.AnyAsync(predicate, cancellationToken);
        }

        #region Write
        public void Add(TEntity entity)
        {
            Entities.Add(entity);
        }

        public void AddRange(List<TEntity> entities)
        {
            Entities.AddRange(entities);
        }
        public void Update(TEntity entity)
        {
            context.Entry(entity).State = EntityState.Modified;
        }
        public void Remove(TEntity entity)
        {
            Entities.Remove(entity);
        }

        public void RemoveRange(List<TEntity> entities)
        {
            Entities.RemoveRange(entities);
        }
        public void SoftRemove(TEntity entity)
        {
            entity.IsDeleted = true;
            entity.ModifiedAt = DateTime.UtcNow;
            context.Entry(entity).State = EntityState.Modified;
        }
        public void SoftRemoveRange(List<TEntity> entities)
        {
            foreach (TEntity entity in entities)
            {
                entity.IsDeleted = true;
                entity.ModifiedAt = DateTime.UtcNow;
                context.Entry(entity).State = EntityState.Modified;
            }
        }

        #endregion
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
    