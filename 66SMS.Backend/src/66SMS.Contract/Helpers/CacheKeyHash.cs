using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace _66SMS.Contracts.Helpers
{
    /// <summary>
    /// Hash object thành chuỗi ngắn để ghép vào Redis cache key (list filter).
    /// </summary>
    public static class CacheKeyHash
    {
        public static string FromObject(object value)
        {
            var json = JsonSerializer.Serialize(value);
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(json));
            return Convert.ToHexString(bytes)[..16].ToLowerInvariant();
        }
    }
}
