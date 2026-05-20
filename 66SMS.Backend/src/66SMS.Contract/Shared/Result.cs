using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;

namespace _66SMS.Contracts.Shared
{
    public class Result<TData> : IResult<TData>
    {
        public int Code { get; private set; }
        public string Message { get; private set; } = string.Empty;
        public TData? Data { get; private set; }
        public ErrorCodes? ErrorCode { get; private set; }
        public bool IsSuccess => Code >= 200 && Code < 300;

        private Result() { }

        public static Result<TData> Success(TData data, string message = "Success")
            => new() { Code = 200, Message = message, Data = data };

        public static Result<TData> Created(TData data, string message = "Created")
            => new() { Code = 201, Message = message, Data = data };

        public static Result<TData> Failure(int code, string message, ErrorCodes? errorCode = null)
            => new() { Code = code, Message = message, ErrorCode = errorCode };

        public static Result<TData> BadRequest(string message = "Bad request", ErrorCodes? errorCode = ErrorCodes.ERR_BAD_REQUEST)
            => Failure(400, message, errorCode);

        public static Result<TData> Unauthorized(string message = "Unauthorized", ErrorCodes? errorCode = ErrorCodes.ERR_UNAUTHORIZED)
            => Failure(401, message, errorCode);

        public static Result<TData> Forbidden(string message = "Forbidden", ErrorCodes? errorCode = ErrorCodes.ERR_FORBIDDEN)
            => Failure(403, message, errorCode);

        public static Result<TData> NotFound(string message = "Not found", ErrorCodes? errorCode = ErrorCodes.ERR_NOT_FOUND)
            => Failure(404, message, errorCode);

        public static Result<TData> Conflict(string message = "Conflict", ErrorCodes? errorCode = ErrorCodes.ERR_CONFLICT)
            => Failure(409, message, errorCode);

        public static Result<TData> ServerError(string message = "Internal server error", ErrorCodes? errorCode = ErrorCodes.ERR_SERVER_ERROR)
            => Failure(500, message, errorCode);

        public static Result<object>Ok() => new () { Code = 200, Message = "Success" };
    }
}
