using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Exceptions;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.Users.Commands.UpdateUser
{
    public class UpdateUserHandler : IRequestHandler<UpdateUserCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        public UpdateUserHandler(IUserSqlRepository userSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            User user = await userSqlRepository.FindByIdAsync(request.Id.Value, false);
            // Map ignore null
            mapper.Map(request, user);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                userSqlRepository.Update(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<object>.Ok();
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                throw new TransactionRollBackException(nameof(UpdateUserHandler), ex.Message);
            }

        }
    }
}
