using FluentValidation;

namespace _66SMS.Application.IdentityService.Users.Commands.DeleteUser
{
    /// <summary>
    /// Validator for <see cref="DeleteUserCommand"/>
    /// </summary>
    public class DeleteUserValidator : AbstractValidator<DeleteUserCommand>
    {
        public DeleteUserValidator()
        {
            When(x => x.Id.HasValue, () =>
            {
                RuleFor(x => x.Id).GreaterThan(0);
            });

            When(x => x.Ids != null && x.Ids.Count > 0, () =>
            {
                RuleFor(x => x.Ids).Must(ids => ids!.All(id => id > 0));
            });
        }
    }
}
