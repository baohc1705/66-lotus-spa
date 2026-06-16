using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace _66SMS.Persistence.Repositories.Sql.Base
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Salon> Salons { get; set; }
        public DbSet<StaffSalon> StaffSalons { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}
