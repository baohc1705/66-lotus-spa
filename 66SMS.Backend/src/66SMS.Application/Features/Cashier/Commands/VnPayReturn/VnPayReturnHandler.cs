using _66SMS.Application.Services.Appointments;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Application.DTOs.Cashier;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace _66SMS.Application.Features.Cashier.Commands.VnPayReturn
{
    public sealed class VnPayReturnHandler(
        IVnPayService vnPayService,
        IAppointmentSqlRepository appointmentRepository,
        ISqlUnitOfWork unitOfWork)
        : IRequestHandler<VnPayReturnCommand, Result<VnPayReturnDto>>
    {
        public async Task<Result<VnPayReturnDto>> Handle(VnPayReturnCommand request, CancellationToken cancellationToken)
        {
            var result = vnPayService.PaymentExecute(request.QueryData);
            var phaseKey = result.Phase == AppointmentPaymentConst.PHASE_DEPOSIT ? "deposit" : "balance";

            if (!result.Success) return Result<VnPayReturnDto>.BadRequest("Giao dịch thất bại hoặc sai chữ ký.");

            var appointment = await appointmentRepository.AsQueryable()
                .Include(a => a.Histories)
                .Include(a => a.Payments)
                .FirstOrDefaultAsync(a => a.Id == result.AppointmentId, cancellationToken);

            if (appointment == null) return Result<VnPayReturnDto>.NotFound("Không tìm thấy đơn.");

            var apply = AppointmentPaymentApplyService.ApplyVnPaySuccess(appointment, result.Phase, result.TransactionId);
            if (!apply.IsSuccess) return Result<VnPayReturnDto>.BadRequest(apply.Message);

            appointmentRepository.Update(appointment);
            await unitOfWork.SaveChangeAsync(cancellationToken);

            return Result<VnPayReturnDto>.Success(new VnPayReturnDto
            {
                AppointmentId = result.AppointmentId,
                PaymentPhase = phaseKey,
                Message = apply.Message
            });
        }
    }
}
