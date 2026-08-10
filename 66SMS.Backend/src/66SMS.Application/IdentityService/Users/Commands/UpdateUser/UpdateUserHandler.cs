using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.IdentityService.Users.Commands.UpdateUser
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
            User? user = await userSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);

            if (user is null)
                return Result<object>.NotFound(UserConst.MSG_USER_ID_NOT_FOUND, ErrorCodes.ERR_USER_NOT_FOUND);

            mapper.Map(request, user);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                userSqlRepository.Update(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                return Result<object>.Ok();
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }

        }
    }
}
