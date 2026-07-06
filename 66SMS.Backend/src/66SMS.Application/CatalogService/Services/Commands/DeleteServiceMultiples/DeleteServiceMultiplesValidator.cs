using FluentValidation;

namespace _66SMS.Application.CatalogService.Services.Commands.DeleteServiceMultiples
{
    public class DeleteServiceMultiplesValidator : AbstractValidator<DeleteServiceMultiplesCommand>
    {
        public DeleteServiceMultiplesValidator()
        {
            RuleFor(x => x.Ids).NotEmpty();
            RuleFor(x => x.Ids).Must(x => x.Distinct().Count() == x.Count);
        }
    }
}
