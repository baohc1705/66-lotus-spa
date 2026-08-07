namespace _66SMS.Contracts.Abstractions
{
    public interface ICookieService
    {
        void SetRefreshToken(string token);
        void DeleteRefreshToken();
        string? GetRefreshToken();
    }
}
