using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.BookingPositions.Commands.CreateBookingPositions
{
    public class CreateBookingPositionHandler : IRequestHandler<CreateBookingPositionCommand, Result<object>>
    {
        private readonly IBookingPositionSqlRepository bookingPositionSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateBookingPositionHandler(
            IBookingPositionSqlRepository bookingPositionSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.bookingPositionSqlRepository = bookingPositionSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(CreateBookingPositionCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                BookingPosition bookingPosition = mapper.Map<BookingPosition>(request);
                bookingPosition.CreatedAt = DateTimeHelper.UtcNow();

                bookingPositionSqlRepository.Add(bookingPosition);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<object>.Created(bookingPosition.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
