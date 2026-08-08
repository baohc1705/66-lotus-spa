using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Appointments.Commands.ReleaseSlotLock
{
    public class ReleaseSlotLockHandler : IRequestHandler<ReleaseSlotLockCommand, Result<object>>
    {
        private readonly IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository;

        public ReleaseSlotLockHandler(IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository)
        {
            this.appointmentSlotLockSqlRepository = appointmentSlotLockSqlRepository;
        }

        public async Task<Result<object>> Handle(ReleaseSlotLockCommand request, CancellationToken cancellationToken)
        {
            var userId = request.LockedByUserId!.Value;
            var lockIds = request.LockIds.Distinct().ToList();

            var locks = await appointmentSlotLockSqlRepository.AsQueryable(asNoTracking: false)
                .Where(x => lockIds.Contains(x.Id)
                    && x.LockedByUserId == userId
                    && x.Status == AppointmentSlotLockConst.STATUS_ACTIVE)
                .ToListAsync(cancellationToken);

            if (locks.Count == 0)
                return Result<object>.Success(new object());

            var now = DateTimeHelper.UtcNow();
            foreach (var slotLock in locks)
            {
                slotLock.Status = AppointmentSlotLockConst.STATUS_RELEASED;
                slotLock.ReleasedAt = now;
                appointmentSlotLockSqlRepository.Update(slotLock);
            }

            await appointmentSlotLockSqlRepository.SaveChangeAsync(cancellationToken);
            return Result<object>.Success(new object());
        }
    }
}
