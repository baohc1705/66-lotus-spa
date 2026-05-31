using FluentValidation;

namespace _66SMS.Application.Features.Users.Commands.DeleteUser
{
    public class DeleteUserValidator : AbstractValidator<DeleteUserCommand>
    {
        public DeleteUserValidator()
        {
            When(x => x.Id.HasValue, () =>
            {
                RuleFor(x => x.Id).GreaterThan(0).WithMessage("Id phải lớn hơn 0.");
            });

            When(x => x.Ids != null && x.Ids.Count > 0, () =>
            {
                RuleFor(x => x.Ids).Must(ids => ids!.All(id => id > 0)).WithMessage("Tất cả Id trong danh sách phải lớn hơn 0.");
            });
        }
    }
}
