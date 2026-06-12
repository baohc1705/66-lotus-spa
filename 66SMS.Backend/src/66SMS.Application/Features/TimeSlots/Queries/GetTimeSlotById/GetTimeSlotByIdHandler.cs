using _66SMS.Application.DTOs.TimeSlots;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.Features.TimeSlots.Queries.GetTimeSlotById
{
    public class GetTimeSlotByIdHandler : IRequestHandler<GetTimeSlotByIdQuery, Result<TimeSlotDto>>
    {
        private readonly ITimeSlotSqlRepository timeSlotSqlRepository;
        private readonly IMapper mapper;

        public GetTimeSlotByIdHandler(
            ITimeSlotSqlRepository timeSlotSqlRepository,
            IMapper mapper)
        {
            this.timeSlotSqlRepository = timeSlotSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<TimeSlotDto>> Handle(GetTimeSlotByIdQuery request, CancellationToken cancellationToken)
        {
            TimeSlot? timeSlot = await timeSlotSqlRepository.FindByIdAsync(request.Id,  false, cancellationToken);
            if (timeSlot == null)
            {
                return Result<TimeSlotDto>.NotFound("Time slot not found.", ErrorCodes.ERR_TIME_SLOT_NOT_FOUND);
            }

            TimeSlotDto timeSlotDto = mapper.Map<TimeSlotDto>(timeSlot);

            return Result<TimeSlotDto>.Success(timeSlotDto);
        }
    }
}
