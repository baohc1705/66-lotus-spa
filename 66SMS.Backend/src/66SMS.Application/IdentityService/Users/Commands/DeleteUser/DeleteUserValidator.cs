using FluentValidation;

namespace _66SMS.Application.IdentityService.Users.Commands.DeleteUser
{
    public class DeleteUserValidator : AbstractValidator<DeleteUserCommand>
    {
        public DeleteUserValidator()
        {
            When(x => x.Id.HasValue, () =>
            {
                RuleFor(x => x.Id).GreaterThan(0).WithMessage("Id ph?i l?n hon 0.");
            });

            When(x => x.Ids != null && x.Ids.Count > 0, () =>
            {
                RuleFor(x => x.Ids).Must(ids => ids!.All(id => id > 0)).WithMessage("T?t c? Id trong danh sách ph?i l?n hon 0.");
            });
        }
    }
}
