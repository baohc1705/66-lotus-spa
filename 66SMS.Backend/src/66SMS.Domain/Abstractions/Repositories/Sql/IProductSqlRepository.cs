using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;

namespace _66SMS.Domain.Abstractions.Repositories.Sql
{
    /// <summary>
    /// Product repository interface
    /// </summary>
    public interface IProductSqlRepository : IGenericSqlRepository<Product, int>
    {
    }
}
