using _66SMS.Application.Features.Auth.Commands.Login;
using _66SMS.Application.Features.Auth.Commands.Logout;
using _66SMS.Application.Features.Auth.Commands.RefreshTokens;
using _66SMS.Application.Features.Users.Commands.CreateUser;
using _66SMS.Contracts.Abstractions;
using _66SMS.Presentation.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.Presentation.Controllers
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

        private void SetRefreshTokenCookies(string token)
        {
            Response.Cookies.Append("refreshToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });
        }
        private string GetIpAddress() => Request.Headers.TryGetValue("X-Forwarded-For", out var ip)
            ? ip.ToString()
            : HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
    }
}
