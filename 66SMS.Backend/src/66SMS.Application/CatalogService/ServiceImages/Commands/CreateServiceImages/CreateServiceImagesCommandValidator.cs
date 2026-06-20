using FluentValidation;

namespace _66SMS.Application.CatalogService.ServiceImages.Commands.CreateServiceImages
{
    public class CreateServiceImagesCommandValidator : AbstractValidator<CreateServiceImagesCommand>
    {
        public CreateServiceImagesCommandValidator()
        {
            RuleFor(x => x.ServiceId).NotEmpty();
            RuleFor(x => x.Url).NotEmpty();
        }
    }
}
