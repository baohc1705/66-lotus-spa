using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Commands.PayDepositWithWallet
{
    public sealed class PayDepositWithWalletCommand : IRequest<Result<object>>
    {
        public int? AppointmentId { get; set; }
        public int? UserId { get; set; }
    }
}
