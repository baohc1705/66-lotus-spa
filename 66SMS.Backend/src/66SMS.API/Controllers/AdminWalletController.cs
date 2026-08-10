using _66SMS.API.Abstractions;
using _66SMS.Application.CustomerService.Wallets.Commands.ManualWalletTransaction;
using _66SMS.Application.CustomerService.Wallets.Queries.GetWallets;
using _66SMS.Application.CustomerService.Wallets.Queries.GetWalletTransactions;
using _66SMS.Contract.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/admin/wallets")]
    [Authorize]
    public class AdminWalletController : ApiController<AdminWalletController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public AdminWalletController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpGet]
        public async Task<IActionResult> GetWallets(CancellationToken cancellationToken)
        {
            var query = new GetWalletsQuery();
            var result = await mediator.Send(query, cancellationToken);
            return HandleResult(result);
        }

        [HttpGet("{id}/transactions")]
        public async Task<IActionResult> GetTransactions(int id, CancellationToken cancellationToken)
        {
            var query = new GetWalletTransactionsQuery { WalletId = id };
            var result = await mediator.Send(query, cancellationToken);
            return HandleResult(result);
        }

        [HttpPost("{id}/transaction")]
        public async Task<IActionResult> ManualTransaction(int id, [FromBody] ManualWalletTransactionCommand command, CancellationToken cancellationToken)
        {
            command.WalletId = id;
            command.UserId = jwtService.GetUserId();
            var result = await mediator.Send(command, cancellationToken);
            return HandleResult(result);
        }
    }
}
