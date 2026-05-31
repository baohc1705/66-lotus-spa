using _66SMS.Contracts.Shared;
using _66SMS.Contracts.Enumerations;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.Shitfs.Commands.CreateShift
{
    public class CreateShiftHandler : IRequestHandler<CreateShiftCommand, Result<object>>
    {
        private readonly IShiftSqlRepository shiftSqlRepository;
        private readonly IShiftPeriodSqlRepository shiftPeriodSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateShiftHandler(
            IShiftSqlRepository shiftSqlRepository,
            IShiftPeriodSqlRepository shiftPeriodSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.shiftSqlRepository = shiftSqlRepository;
            this.shiftPeriodSqlRepository = shiftPeriodSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(CreateShiftCommand request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
