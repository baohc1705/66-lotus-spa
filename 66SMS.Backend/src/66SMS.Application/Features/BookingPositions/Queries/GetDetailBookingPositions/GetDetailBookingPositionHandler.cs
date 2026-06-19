using _66SMS.Application.DTOs.BookingPositions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.BookingPositions.Queries.GetDetailBookingPositions
{
    public class GetDetailBookingPositionHandler : IRequestHandler<GetDetailBookingPositionQuery, Result<BookingPositionDto>>
    {
        private readonly IBookingPositionSqlRepository bookingPositionSqlRepository;
        private readonly IMapper mapper;

        public GetDetailBookingPositionHandler(IBookingPositionSqlRepository bookingPositionSqlRepository, IMapper mapper)
        {
            this.bookingPositionSqlRepository = bookingPositionSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<BookingPositionDto>> Handle(GetDetailBookingPositionQuery request, CancellationToken cancellationToken)
        {
            BookingPositionDto? bookingPositionDto = await bookingPositionSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .ProjectTo<BookingPositionDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (bookingPositionDto == null)
            {
                return Result<BookingPositionDto>.NotFound(BookingPositionConst.MSG_BOOKING_POSITION_NOT_FOUND, ErrorCodes.ERR_BOOKING_POSITION_NOT_FOUND);
            }

            return Result<BookingPositionDto>.Success(bookingPositionDto);
        }
    }
}
