using _66SMS.Contracts.Enumerations;

namespace _66SMS.Contracts.Exceptions
{
    public class GlobalException : Exception
    {
        public int StatusCode { get; }
        public ErrorCodes ErrorCode { get; }

        public GlobalException(int statusCode, string message, ErrorCodes errorCode) : base(message)
        {
            StatusCode = statusCode;
            ErrorCode = errorCode;
        }

        // Factory methods
        public static GlobalException NotFound(string message = "Not found")
            => new(404, message, ErrorCodes.ERR_NOT_FOUND);

        public static GlobalException BadRequest(string message = "Bad request")
            => new(400, message, ErrorCodes.ERR_BAD_REQUEST);

        public static GlobalException Conflict(string message = "Conflict")
            => new(409, message, ErrorCodes.ERR_CONFLICT);

        public static GlobalException Forbidden(string message = "Forbidden")
            => new(403, message, ErrorCodes.ERR_FORBIDDEN);

        public static GlobalException Unauthorized(string message = "Unauthorized")
            => new(401, message, ErrorCodes.ERR_UNAUTHORIZED);

        public static GlobalException ServerError(string message = "Internal server error")
            => new(500, message, ErrorCodes.ERR_SERVER_ERROR);
    }
}
