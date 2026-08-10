using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using FluentValidation;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace _66SMS.API.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate next;
        private readonly ILogger<GlobalExceptionMiddleware> logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            this.next = next;
            this.logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception occurred.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = exception switch
            {
                ValidationException validationEx => Result<object>.BadRequest(string.Join(", ", validationEx.Errors.Select(e => e.ErrorMessage)), ErrorCodes.ERR_BAD_REQUEST),
                UnauthorizedAccessException => Result<object>.Unauthorized("Unauthorized access."),
                _ => Result<object>.ServerError("An internal server error occurred.")
            };

            context.Response.StatusCode = response.Code;

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
                Converters = { new JsonStringEnumConverter() }
            };
            var json = JsonSerializer.Serialize(response, options);

            await context.Response.WriteAsync(json);
        }
    }
}
