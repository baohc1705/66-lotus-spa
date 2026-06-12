using _66SMS.Contracts.Constants;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Persistence.Repositories.Sql;
using _66SMS.Persistence.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace _66SMS.Persistence.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddPersistence(this IServiceCollection services,IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString(DatabaseConst.CONN_SQL_SERVER);
            services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));
            services.RegisterRepositories();
            return services;
        }

        private static IServiceCollection RegisterRepositories(this IServiceCollection services)
        {
            
            services.AddScoped(typeof(IGenericSqlRepository<,>), typeof(GenericSqlRepository<,>));
            services.AddScoped<ISqlUnitOfWork, SqlUnitOfWork>();
            services.AddScoped<IUserSqlRepository, UserSqlRepository>();
            services.AddScoped<IPermissionSqlRepository, PermissionSqlRepository>();
            services.AddScoped<IRefreshTokenSqlRepository, RefreshTokenSqlRepository>();
            services.AddScoped<IRolePermissionSqlRepository, RolePermissionSqlRepository>();
            services.AddScoped<IRoleSqlRepository, RoleSqlRepository>();
            services.AddScoped<IUserRoleSqlRepository, UserRoleSqlRepository>();
            services.AddScoped<ICustomerSqlRepository, CustomerSqlRepository>();
            services.AddScoped<IStaffSqlRepository, StaffSqlRepository>();
            services.AddScoped<IShiftSqlRepository, ShiftSqlRepository>();
            services.AddScoped<IShiftPeriodSqlRepository, ShiftPeriodSqlRepository>();
            services.AddScoped<IWorkScheduleSqlRepository, WorkScheduleSqlRepository>();
            
            services.AddScoped<IProductCategorySqlRepository, ProductCategorySqlRepository>();
            services.AddScoped<IProductSqlRepository, ProductSqlRepository>();
            services.AddScoped<IProductImageSqlRepository, ProductImageSqlRepository>();

            services.AddScoped<IServiceCategorySqlRepository, ServiceCategorySqlRepository>();
            services.AddScoped<IServiceSqlRepository, ServiceSqlRepository>();
            services.AddScoped<IServiceImageSqlRepository, ServiceImageSqlRepository>();
            services.AddScoped<IServiceProductSqlRepository, ServiceProductSqlRepository>();

            services.AddScoped<IBookingRoomSqlRepository, BookingRoomSqlRepository>();
            services.AddScoped<IBookingPositionSqlRepository, BookingPositionSqlRepository>();

            return services;
        }
    }
}

