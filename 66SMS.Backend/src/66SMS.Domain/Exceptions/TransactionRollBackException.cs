namespace _66SMS.Domain.Exceptions
{
    public class TransactionRollBackException : Exception
    {
        public TransactionRollBackException(string? handler, string message) : base($"{handler}: {message}")
        {
        }
    }
}
