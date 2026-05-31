using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using _66SMS.Contracts.Shared;

namespace _66SMS.Presentation.Abstractions
{
    /// <summary>
    /// Base controller class with common properties and methods for all API controllers.
    /// Uses <typeparamref name="T"/> for strongly-typed logging.
    /// </summary>
    /// <typeparam name="T">The type of the derived controller.</typeparam>
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public abstract class ApiController<T> : ControllerBase
    {
        private ILogger<T>? logger;

        /// <summary>
        /// Gets the strongly-typed logger instance from the DI container.
        /// </summary>
        protected ILogger<T> Logger => logger ??= HttpContext.RequestServices.GetRequiredService<ILogger<T>>();

        /// <summary>
        /// Translates a generic Result<T> into a standard HTTP response.
        /// </summary>
        protected IActionResult HandleResult<TData>(Result<TData> result)
        {
            return StatusCode(result.Code, result);
        }
    }
}
