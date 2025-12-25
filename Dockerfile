FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["src/SnaporyIngest/SnaporyIngest.csproj", "src/SnaporyIngest/"]
RUN dotnet restore "src/SnaporyIngest/SnaporyIngest.csproj"
COPY . .
WORKDIR "/src/src/SnaporyIngest"
RUN dotnet build "SnaporyIngest.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SnaporyIngest.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SnaporyIngest.dll"]
