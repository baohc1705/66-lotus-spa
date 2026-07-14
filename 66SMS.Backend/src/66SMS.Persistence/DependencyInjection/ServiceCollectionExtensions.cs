using _66SMS.Application.Abstractions;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Settings;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Persistence.Repositories.Sql;
using _66SMS.Persistence.Repositories.Sql.Base;
using _66SMS.Persistence.StoredProcedures;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace _66SMS.Persistence.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddPersistence(this IServiceCollection services,IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString(DatabaseConst.CONN_SQL_SERVER)
                ?? configuration.GetConnectionString("SqlServerConn");
            services.AddDbContext<ApplicationDbContext>(options =>
            {
               options.UseSqlServer(connectionString)
               ;
            });

            services.AddOptions<StoredProcedureSettings>()
                .Bind(configuration.GetSection(StoredProcedureSettings.SectionName));
            services.AddScoped<IStoredProcedureExecutor, SqlStoredProcedureExecutor>();

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

            services.AddScoped<IAppointmentSqlRepository, AppointmentSqlRepository>();
            services.AddScoped<IAppointmentSlotLockSqlRepository, AppointmentSlotLockSqlRepository>();
            services.AddScoped<IAppointmentServiceSqlRepository, AppointmentServiceSqlRepository>();
            services.AddScoped<IAppointmentPaymentSqlRepository, AppointmentPaymentSqlRepository>();

            services.AddScoped<IWalletSqlRepository, WalletSqlRepository>();
            services.AddScoped<IWalletTransactionSqlRepository, WalletTransactionSqlRepository>();

            services.AddScoped<IMembershipTierSqlRepository, MembershipTierSqlRepository>();
            services.AddScoped<IMembershipCardSqlRepository, MembershipCardSqlRepository>();

            services.AddScoped<ITimeSlotSqlRepository, TimeSlotSqlRepository>();
            services.AddScoped<IBookingContextProvider, BookingContextProvider>();

            services.AddScoped<ISalonSqlRepository, SalonSqlRepository>();
            services.AddScoped<IStaffSalonSqlRepository, StaffSalonSqlRepository>();
            services.AddScoped<IOtpVerificationSqlRepository, OtpVerificationSqlRepository>();

            services.AddScoped<IProvinceSqlRepository, ProvinceSqlRepository>();
            services.AddScoped<IWardSqlRepository, WardSqlRepository>();

            services.AddScoped<ITreatmentCourseSqlRepository, TreatmentCourseSqlRepository>();

            services.AddScoped<ICertificateTypeSqlRepository, CertificateTypeSqlRepository>();
            services.AddScoped<IStaffCertificateSqlRepository, StaffCertificateSqlRepository>();

            services.AddScoped<IInvoiceSqlRepository, InvoiceSqlRepository>();
            services.AddScoped<IInvoiceItemSqlRepository, InvoiceItemSqlRepository>();

            services.AddScoped<IAttendanceSqlRepository, AttendanceSqlRepository>();
            services.AddScoped<IPayrollSqlRepository, PayrollSqlRepository>();
            services.AddScoped<IPromotionSqlRepository, PromotionSqlRepository>();
            return services;
        }
    }
}

