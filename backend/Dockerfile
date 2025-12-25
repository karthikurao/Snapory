# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["src/Snapory.Api/Snapory.Api.csproj", "src/Snapory.Api/"]
COPY ["src/Snapory.Application/Snapory.Application.csproj", "src/Snapory.Application/"]
COPY ["src/Snapory.Domain/Snapory.Domain.csproj", "src/Snapory.Domain/"]
COPY ["src/Snapory.Infrastructure/Snapory.Infrastructure.csproj", "src/Snapory.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/Snapory.Api/Snapory.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/src/Snapory.Api"
RUN dotnet build "Snapory.Api.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "Snapory.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

EXPOSE 5000

COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "Snapory.Api.dll"]
