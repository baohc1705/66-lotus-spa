using _66SMS.Contracts.Shared;
using _66SMS.Application.DTOs.Cashier;
using MediatR;
using System.Collections.Generic;

namespace _66SMS.Application.Features.Cashier.Commands.VnPayReturn
{
    public sealed class VnPayReturnCommand : IRequest<Result<VnPayReturnDto>>
    {
        public IDictionary<string, string> QueryData { get; set; } = new Dictionary<string, string>();
    }
}
