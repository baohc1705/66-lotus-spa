using _66SMS.API.Abstractions;
using _66SMS.Application.Features.Provinces.Queries.GetAllProvinces;
using _66SMS.Application.Features.Wards.Queries.GetAllWardsByProvince;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class AddressController : ApiController<AddressController>
    {
        private readonly IMediator _mediator;

        public AddressController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("provinces")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProvinces(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetAllProvincesQuery(), cancellationToken);
            return HandleResult(result);
        }

        [HttpGet("wards")]
        [AllowAnonymous]
        public async Task<IActionResult> GetWards([FromQuery] string provinceCode, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetAllWardsByProvinceQuery { ProvinceCode = provinceCode }, cancellationToken);
            return HandleResult(result);
        }
    }
}
