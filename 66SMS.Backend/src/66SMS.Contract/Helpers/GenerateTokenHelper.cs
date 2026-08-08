using System.Security.Cryptography;
using System.Text;

namespace _66SMS.Contract.Helpers
{
    public static class GenerateTokenHelper
    {
        public static string Generate()
        {
            return Base64UrlEncode(RandomNumberGenerator.GetBytes(64));
        }

        public static string Hash(string rawToken)
        {
            byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
            return Convert.ToHexString(bytes);
        }

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
