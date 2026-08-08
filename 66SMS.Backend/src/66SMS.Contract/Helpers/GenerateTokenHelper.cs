using System.Security.Cryptography;
using System.Text;

namespace _66SMS.Contract.Helpers
{
    public static class GenerateTokenHelper
    {
        /// <summary>
        /// Sinh token ngẫu nhiên, an toàn và URL-safe (dùng cho link reset/confirm).
        /// </summary>
        public static string Generate()
        {
            // Base64Url: thay +/ và bỏ '=' để token có thể đặt thẳng trong query string mà không cần encode.
            return Base64UrlEncode(RandomNumberGenerator.GetBytes(64));
        }

        /// <summary>
        /// Hash token bằng SHA-256 để LƯU vào DB. Token thật chỉ gửi qua email,
        /// trong DB chỉ giữ bản hash → nếu lộ DB attacker cũng không reset được.
        /// </summary>
        public static string Hash(string rawToken)
        {
            byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
            return Convert.ToHexString(bytes);
        }

        /// <summary>
        /// So sánh token người dùng gửi lên với hash đã lưu, chống timing attack.
        /// </summary>
        public static bool Verify(string rawToken, string? storedHash)
        {
            if (string.IsNullOrEmpty(storedHash))
                return false;

            byte[] computed = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
            byte[] stored = Convert.FromHexString(storedHash);
            return CryptographicOperations.FixedTimeEquals(computed, stored);
        }

        private static string Base64UrlEncode(byte[] bytes)
            => Convert.ToBase64String(bytes)
                .Replace('+', '-')
                .Replace('/', '_')
                .TrimEnd('=');
    }
}
