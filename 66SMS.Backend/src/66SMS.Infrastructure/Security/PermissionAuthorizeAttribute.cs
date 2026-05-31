using Microsoft.AspNetCore.Authorization;

namespace _66SMS.Infrastructure.Security
{
    public class PermissionAuthorizeAttribute : AuthorizeAttribute
    {
        /// <summary>
        /// Định nghĩa kiểu permission
        /// </summary>
        /// <param name="resource"></param>
        /// <param name="action"></param>
        public PermissionAuthorizeAttribute(string resource, string action)
        {
            Policy = $"permission:{resource}:{action}";
        }
    }
}
