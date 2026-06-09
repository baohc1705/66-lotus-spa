using _66SMS.API.Abstractions;
using _66SMS.Application.Features.Auth.Commands.AssignPermissions;
using _66SMS.Application.Features.Auth.Commands.ChangePassword;
using _66SMS.Application.Features.Auth.Commands.CreatePermission;
using _66SMS.Application.Features.Auth.Commands.CreateRole;
using _66SMS.Application.Features.Auth.Commands.ForgotPassword;
using _66SMS.Application.Features.Auth.Commands.Login;
using _66SMS.Application.Features.Auth.Commands.Logout;
using _66SMS.Application.Features.Auth.Commands.RefreshTokens;
using _66SMS.Application.Features.Auth.Commands.ResetPassword;
using _66SMS.Application.Features.Auth.Queries.GetAllRoles;
using _66SMS.Application.Features.Users.Commands.CreateUser;
using _66SMS.Contracts.Abstractions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Asp.Versioning;

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
        public async Task<IActionResult> Register(CreateUserCommand createUserCommand)
        {
            //createUserCommand.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(createUserCommand);
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
