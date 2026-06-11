using FluentValidation;

namespace _66SMS.Application.Features.ServiceImages.Commands.UpdateServiceImages
{
    public class UpdateServiceImagesCommandValidator : AbstractValidator<UpdateServiceImagesCommand>
    {
        public UpdateServiceImagesCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
