using _66SMS.Application.DTOs.TimeSlots;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.BookingService.TimeSlots.Queries.GetDetailTimeSlot
{
    public class GetDetailTimeSlotHandler : IRequestHandler<GetDetailTimeSlotQuery, Result<TimeSlotDto>>
    {
        private readonly ITimeSlotSqlRepository timeSlotSqlRepository;
        private readonly IMapper mapper;

        public GetDetailTimeSlotHandler(
            ITimeSlotSqlRepository timeSlotSqlRepository,
            IMapper mapper)
        {
            this.timeSlotSqlRepository = timeSlotSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<TimeSlotDto>> Handle(GetDetailTimeSlotQuery request, CancellationToken cancellationToken)
        {
            TimeSlot? timeSlot = await timeSlotSqlRepository.FindByIdAsync(request.Id,  false, cancellationToken);
            if (timeSlot == null)
            {
                return Result<TimeSlotDto>.NotFound(TimeSlotConst.MSG_TIME_SLOT_NOT_FOUND, ErrorCodes.ERR_TIME_SLOT_NOT_FOUND);
            }

            TimeSlotDto timeSlotDto = mapper.Map<TimeSlotDto>(timeSlot);

            return Result<TimeSlotDto>.Success(timeSlotDto);
        }
    }
}
