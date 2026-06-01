using _66SMS.Contracts.Exceptions;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Settings;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class UserSqlRepository : GenericSqlRepository<User, int>, IUserSqlRepository
    {

        public UserSqlRepository(ApplicationDbContext context, IOptions<JwtSettings> options) : base(context)
        {
       
        }

        public void Add(User entity)
        {
            entity.CreatedAt = DateTimeHelper.UtcNow();
            base.Add(entity);
        }

        public void AddRange(List<User> entities)
        {
            foreach (var entity in entities)
                entity.CreatedAt = DateTimeHelper.UtcNow();
            base.AddRange(entities);
        }
        public void Update(User entity)
        {
            entity.ModifiedAt = DateTimeHelper.UtcNow();
            base.Update(entity);
        }

        public async Task<User?> GetByIdAsync(int id, bool asNoTracking = true, CancellationToken cancellationToken = default)
        {
            User? user = await base.GetByIdAsync(id, asNoTracking, cancellationToken);
            if (user == null)
                throw GlobalException.NotFound("User not found id");
            return user;
        }
    }
}
