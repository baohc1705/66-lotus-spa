namespace _66SMS.Contracts.Abstractions
{
    public interface IPasswordHash
    {
        string Hash(string password);
        bool Verify(string password, string hash);
    }
}
