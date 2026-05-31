using _66SMS.Contracts.Enumerations;

namespace _66SMS.Contracts.Abstractions
{
    public interface IResult<TEntity>
    {
        int Code { get; }
        string Message { get; }
        TEntity? Data { get; }
        ErrorCodes? ErrorCode { get; }
        bool IsSuccess { get; }
    }
}
