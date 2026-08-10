using _66SMS.API.Commons;
using _66SMS.API.DependencyInjection.Extensions;
using _66SMS.API.Middleware;
using _66SMS.Application.DependencyInjection;
using _66SMS.Infrastructure.DependencyInjection;
using _66SMS.Persistence.DependencyInjection;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<RouteOptions>(options => options.LowercaseUrls = true);
builder.Services.AddControllers(options =>
{
    options.Conventions.Add(new RouteTokenTransformerConvention(new SlugifyParameterTransformer()));
}).AddJsonConfig();
builder.Services.AddEndpointsApiExplorer();
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
var apiConfig = builder.Configuration.GetSection(ApiConfig.SectionName).Get<ApiConfig>() ?? new ApiConfig();
builder.Services.AddSwaggerWithJwt(apiConfig);
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddCorsPolicy(builder.Configuration);

var app = builder.Build();
app.UseMiddleware<GlobalExceptionMiddleware>();
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerWithUi();
    app.UseHttpsRedirection();
}
app.UseCors(CorsExtensions.PolicyName);
app.UseAuthentication();
app.UseAuthorization();
app.MapHealthEndpoint();
app.MapNotificationHubs();
app.MapControllers();
app.Run();
