using _66SMS.Application.DTOs.Wallets;
using _66SMS.Contracts.Shared;
using MediatR;
using System.Collections.Generic;

namespace _66SMS.Application.Features.Wallets.Queries.GetWallets
{
    public class GetWalletsQuery : IRequest<Result<IEnumerable<AdminWalletDto>>>
    {
    }
}
