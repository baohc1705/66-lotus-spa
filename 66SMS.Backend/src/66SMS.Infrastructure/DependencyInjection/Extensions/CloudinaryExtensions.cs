using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Settings;
using _66SMS.Infrastructure.Storage.Cloudinary;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace _66SMS.Infrastructure.DependencyInjection.Extensions
{
    /// <summary>
    /// Extension đăng ký dịch vụ lưu trữ file (Cloudinary) vào DI container,
    /// tách riêng để giữ ServiceCollectionExtensions gọn gàng.
    /// </summary>
    public static class CloudinaryExtensions
    {
        /// <summary>
        /// Bind <see cref="CloudinarySettings"/> và đăng ký <see cref="IFileStorageService"/>.
        /// </summary>
        public static IServiceCollection AddCloudinaryStorage(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<CloudinarySettings>(configuration.GetSection(CloudinarySettings.SectionName));
            services.AddScoped<IFileStorageService, CloudinaryFileStorageService>();
            return services;
        }
    }
}
