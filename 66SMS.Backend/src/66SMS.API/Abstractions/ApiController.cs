using _66SMS.Contract.Shared;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Abstractions
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
        /// <summary>
        /// Translates a generic Result<T> into a standard HTTP response.
        /// </summary>
        protected IActionResult HandleResult<TData>(Result<TData> result)
        {
            return StatusCode(result.Code, result);
        }
    }
}
