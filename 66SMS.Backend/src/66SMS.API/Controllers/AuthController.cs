using _66SMS.API.Abstractions;
using _66SMS.Application.IdentityService.Roles.Commands.AssignPermissions;
using _66SMS.Application.IdentityService.Permissions.Commands.DeletePermission;
using _66SMS.Application.IdentityService.Roles.Commands.DeleteRole;
using _66SMS.Application.IdentityService.Permissions.Commands.UpdatePermission;
using _66SMS.Application.IdentityService.Roles.Commands.UpdateRole;
using _66SMS.Application.IdentityService.Auth.Commands.ChangePassword;
using _66SMS.Application.IdentityService.Permissions.Commands.CreatePermission;
using _66SMS.Application.IdentityService.Roles.Commands.CreateRole;
using _66SMS.Application.IdentityService.Auth.Commands.ForgotPassword;
using _66SMS.Application.IdentityService.Auth.Commands.Login;
using _66SMS.Application.IdentityService.Auth.Commands.Logout;
using _66SMS.Application.IdentityService.Auth.Commands.RefreshTokens;
using _66SMS.Application.IdentityService.Auth.Commands.Registers;
using _66SMS.Application.IdentityService.Auth.Commands.ResetPassword;
using _66SMS.Application.IdentityService.Auth.Commands.SendEmailOtp;
using _66SMS.Application.IdentityService.Auth.Commands.VerifyEmailOtp;
using _66SMS.Application.IdentityService.Permissions.Queries.GetAllPermissions;
using _66SMS.Application.IdentityService.Roles.Queries.GetAllRoles;
using _66SMS.Contracts.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class AuthController : ApiController<AuthController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public AuthController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginCommand command)
        {
            command.IpAddress = GetIpAddress();
            var result = await mediator.Send(command);
            if (result.Data != null)
                SetRefreshTokenCookies(result.Data.RefreshToken);
            return HandleResult(result);
        }

        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken(RefreshTokenCommand command)
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (!string.IsNullOrEmpty(refreshToken) && string.IsNullOrEmpty(command.Token))
            {
                command.Token = refreshToken;
            }

            command.IpAddress = GetIpAddress();
            var result = await mediator.Send(command);
            if (result.Data != null)
                SetRefreshTokenCookies(result.Data.RefreshToken);
            return HandleResult(result);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            LogoutCommand command = new LogoutCommand();
            command.IpAddress = GetIpAddress();

            if (!string.IsNullOrEmpty(refreshToken))
                command.Token = refreshToken;
            var result = await mediator.Send(command);
            if (result != null)
                Response.Cookies.Delete("refreshToken");
            return HandleResult(result!);
        }

       
        [HttpGet("permission")]
        [Authorize]
        public async Task<IActionResult> GetAllPermissions()
        {
            var result = await mediator.Send(new GetAllPermissionsQuery());
            return HandleResult(result);
        }

        [HttpPost("permission")]
        [Authorize]
        public async Task<IActionResult> CreatePermission([FromBody] CreatePermissionCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("role")]
        [Authorize]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [Authorize]
        [HttpPost("role/assign-permisison")]
        public async Task<IActionResult> AssignPermission([FromBody] AssignPermissionsCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }
        [Authorize]
        [HttpGet("role")]
        public async Task<IActionResult> GetAllRole([FromQuery]GetAllRoleQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [Authorize]
        [HttpPut("role/{id}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [Authorize]
        [HttpDelete("role/{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var result = await mediator.Send(new DeleteRoleCommand { Id = id });
            return HandleResult(result);
        }

        [Authorize]
        [HttpPut("permission/{id}")]
        public async Task<IActionResult> UpdatePermission(int id, [FromBody] UpdatePermissionCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [Authorize]
        [HttpDelete("permission/{id}")]
        public async Task<IActionResult> DeletePermission(int id)
        {
            var result = await mediator.Send(new DeletePermissionCommand { Id = id });
            return HandleResult(result);
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("send-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> SendOtp([FromBody] SendEmailOtpCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("verify-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyEmailOtpCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
        {
            command.Id = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        private void SetRefreshTokenCookies(string token)
        {
            Response.Cookies.Append("refreshToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            });
        }
        private string GetIpAddress() => Request.Headers.TryGetValue("X-Forwarded-For", out var ip)
            ? ip.ToString()
            : HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
    }
}
