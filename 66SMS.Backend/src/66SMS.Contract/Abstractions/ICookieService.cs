namespace _66SMS.Contract.Abstractions
{
    public interface ICookieService
    {
        void SetRefreshToken(string token);
        void DeleteRefreshToken();
        string? GetRefreshToken();
    }
}
