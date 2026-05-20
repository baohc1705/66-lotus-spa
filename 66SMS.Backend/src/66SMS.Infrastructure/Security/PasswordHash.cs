using _66SMS.Contracts.Abstractions;
using Isopoh.Cryptography.Argon2;

namespace _66SMS.Infrastructure.Security
{
    public class PasswordHash : IPasswordHash
    {
        public string Hash(string password)
        {
            return Argon2.Hash(password);
        }

        public bool Verify(string password, string hash)
        {
            return Argon2.Verify(password, hash);
        }
    }
}
