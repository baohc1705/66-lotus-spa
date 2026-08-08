namespace _66SMS.Contract.Abstractions
{
    public interface IPasswordHash
    {
        string Hash(string password);
        bool Verify(string passwordHash, string rawPassword);
    }
}
