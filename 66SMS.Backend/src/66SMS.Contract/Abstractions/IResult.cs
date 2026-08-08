using _66SMS.Contract.Enumerations;

namespace _66SMS.Contract.Abstractions
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
