using _66SMS.Application.DTOs.TimeSlots;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.TimeSlots.Queries.GetDetailTimeSlot
{
    public class GetDetailTimeSlotHandler : IRequestHandler<GetDetailTimeSlotQuery, Result<TimeSlotDto>>
    {
        private readonly ITimeSlotSqlRepository timeSlotSqlRepository;

        public GetDetailTimeSlotHandler(ITimeSlotSqlRepository timeSlotSqlRepository)
        {
            this.timeSlotSqlRepository = timeSlotSqlRepository;
        }

        public async Task<Result<TimeSlotDto>> Handle(GetDetailTimeSlotQuery request, CancellationToken cancellationToken)
        {
            var timeSlotDto = await timeSlotSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .Select(x => new TimeSlotDto
                {
                    Id = x.Id,
                    StartTime = x.StartTime,
                    EndTime = x.EndTime,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (timeSlotDto == null)
                return Result<TimeSlotDto>.NotFound(TimeSlotConst.MSG_TIME_SLOT_NOT_FOUND, ErrorCodes.ERR_TIME_SLOT_NOT_FOUND);

            return Result<TimeSlotDto>.Success(timeSlotDto);
        }
    }
}
