# Build context = thu muc 66SMS.Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/66SMS.Contract/66SMS.Contract.csproj src/66SMS.Contract/
COPY src/66SMS.Domain/66SMS.Domain.csproj src/66SMS.Domain/
COPY src/66SMS.Application/66SMS.Application.csproj src/66SMS.Application/
COPY src/66SMS.Persistence/66SMS.Persistence.csproj src/66SMS.Persistence/
COPY src/66SMS.Infrastructure/66SMS.Infrastructure.csproj src/66SMS.Infrastructure/
COPY src/66SMS.API/66SMS.API.csproj src/66SMS.API/

RUN dotnet restore src/66SMS.API/66SMS.API.csproj

COPY src/ src/
RUN dotnet publish src/66SMS.API/66SMS.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

LABEL maintainer="66SMS"
LABEL version="1.0"

WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

RUN adduser --disabled-password --gecos "" --uid 10001 appuser

COPY --from=build /app/publish .
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

ENTRYPOINT ["dotnet", "66SMS.API.dll"]
