using _66SMS.Contract.Abstractions;
using Isopoh.Cryptography.Argon2;

namespace _66SMS.Infrastructure.Security
{
    public class PasswordHash : IPasswordHash
    {
        public string Hash(string password)
        {
            return Argon2.Hash(password);
        }

        public bool Verify(string passwordHash, string rawPassword)
        {
            return Argon2.Verify(passwordHash, rawPassword);
        }
    }
}
