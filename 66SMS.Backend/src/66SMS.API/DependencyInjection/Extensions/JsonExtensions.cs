using System.Text.Json.Serialization;

namespace _66SMS.API.DependencyInjection.Extensions
{
    public static class JsonExtensions
    {
        /// <summary>
        /// Extension cài đặt json trong api
        /// </summary>
        /// <param name="builder"></param>
        /// <returns></returns>
        public static IMvcBuilder AddJsonConfig(this IMvcBuilder builder)
        {
            builder.AddJsonOptions(options =>
            {
                // Cài đặt nếu field nào null không hiển thị trong api
                options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                // Cài đặt convert enum
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                // Cài đặt bỏ qua các field nếu include cycle
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            });

            return builder;
        }
    }
}
