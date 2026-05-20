using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.Features.Auth.Commands.Login
{
    public class LoginHandler : IRequestHandler<LoginCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IMapper mapper;
        private readonly IPasswordHash passwordHash;
        

        public LoginHandler(IUserSqlRepository userSqlRepository, IMapper mapper, IPasswordHash passwordHash)
        {
            this.userSqlRepository = userSqlRepository;
            this.mapper = mapper;
            this.passwordHash = passwordHash;
        }

        public async Task<Result<object>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            User? userExisted = await userSqlRepository.FindSingleAsync(x => x.UserName.Equals(request.UsernameOrEmail) || x.Email.Equals(request.UsernameOrEmail), ct: cancellationToken);
            if (userExisted == null)
                return Result<object>.BadRequest("Username or email wrong");

            if (userExisted.LogoutEnabled)
                return Result<object>.BadRequest($"Account is locked. Try again after {userExisted.LogoutEnd:HH:mm dd/MM/yyyy}");

            if (!passwordHash.Verify(request.Password, userExisted.PasswordHash))
            {
                userSqlRepository.IncrementFailedLoginAsync(userExisted, cancellationToken);
                await userSqlRepository.SaveChangeAsync(cancellationToken);

                return userExisted.LogoutEnabled ? Result<object>.BadRequest("Account has been block because login many time")
                    : Result<object>.BadRequest("Password wrong");
            }

            userExisted.AccessFailedCount = 0;
            userExisted.LogoutEnabled = false;
            userSqlRepository.Update(userExisted);
                
        }

       
    }
}
