using _66SMS.Contracts.Shared;
using _66SMS.Application.DTOs.Cashier;
using MediatR;
using System.Collections.Generic;

namespace _66SMS.Application.Features.Cashier.Queries.GetOnlineAppointments
{
    public sealed class GetOnlineAppointmentsQuery : IRequest<Result<IReadOnlyList<CashierBookingDto>>>
    {
    }
}
