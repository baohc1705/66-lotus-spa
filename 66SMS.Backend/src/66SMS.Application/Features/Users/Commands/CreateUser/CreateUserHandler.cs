using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Exceptions;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.Features.Users.Commands.CreateUser
{
    public class CreateUserHandler : IRequestHandler<CreateUserCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IPasswordHash passwordHash;
        public CreateUserHandler(IUserSqlRepository userSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper, IPasswordHash passwordHash)
        {
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.passwordHash = passwordHash;
        }
        public async Task<Result<object>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {

            var userExisted = await userSqlRepository.ExistsAsync(x => x.Email.Equals(request.Email) || x.UserName.Equals(request.UserName), ct: cancellationToken);
            if (userExisted)
                return Result<object>.BadRequest("User and email existed");

            User? user = mapper.Map<User>(request);

            using var transaction = await userSqlRepository.BeginTransactionAsync(cancellationToken);
            try
            {
                user.PasswordHash = passwordHash.Hash(request.Password);
                userSqlRepository.Add(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                return Result<object>.Ok();
            }
            catch(Exception ex)
            {
                transaction.Rollback();
                throw new TransactionRollBackException(typeof(CreateUserCommand).Name, ex.Message);
            }
        }
    }
}
