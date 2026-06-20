using FluentValidation;

namespace _66SMS.Application.CatalogService.ServiceImages.Commands.DeleteServiceImages
{
    public class DeleteServiceImagesCommandValidator : AbstractValidator<DeleteServiceImagesCommand>
    {
        public DeleteServiceImagesCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
