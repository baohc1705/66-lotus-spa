using FluentValidation;

namespace _66SMS.Application.CatalogService.ServiceImages.Commands.UpdateServiceImages
{
    public class UpdateServiceImagesCommandValidator : AbstractValidator<UpdateServiceImagesCommand>
    {
        public UpdateServiceImagesCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
