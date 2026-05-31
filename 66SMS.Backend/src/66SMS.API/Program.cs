using _66SMS.API.DependencyInjection.Extensions;
using _66SMS.API.Middleware;
using _66SMS.Application.DependencyInjection;
using _66SMS.Infrastructure.DependencyInjection.Extensions;
using _66SMS.Persistence.DependencyInjection;
using _66SMS.Presentation.Abstractions;
using _66SMS.Presentation.Commons;
using Asp.Versioning;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers().AddApplicationPart(typeof(ApiController<>).Assembly).AddJsonConfig();
builder.Services.AddEndpointsApiExplorer();

// API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
}).AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

// Swagger + JWT Security Definition
var apiConfig = builder.Configuration.GetSection(ApiConfig.SectionName).Get<ApiConfig>() ?? new ApiConfig();
builder.Services.AddSwaggerWithJwt(apiConfig);

// Layer registrations
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddPersistence(builder.Configuration);

builder.Services.AddCorsPolicy(builder.Configuration);

var app = builder.Build();
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
    app.UseSwaggerWithUi();

app.UseHttpsRedirection();
app.UseCors(CorsExtensions.PolicyName);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();