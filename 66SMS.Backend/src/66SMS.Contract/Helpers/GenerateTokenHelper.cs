using System.Security.Cryptography;

namespace _66SMS.Contracts.Helpers
{
    public static class GenerateTokenHelper
    {
        public static string Generate()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        }
    }
}
