using System.Text.Json.Serialization;
using Azure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Serilog;
using Serilog.Sinks.ApplicationInsights.TelemetryConverters;
using TeamPoll.Data;
using TeamPoll.Middleware;
using TeamPoll.Services;

var builder = WebApplication.CreateBuilder(args);

// --- Configuration: Key Vault in non-dev (Managed Identity via DefaultAzureCredential) ---
var keyVaultUri = builder.Configuration["KeyVault:Uri"];
if (!string.IsNullOrWhiteSpace(keyVaultUri))
{
    builder.Configuration.AddAzureKeyVault(new Uri(keyVaultUri), new DefaultAzureCredential());
}

// --- Serilog: Console always; Application Insights when a connection string is configured. ---
builder.Host.UseSerilog((context, _, configuration) =>
{
    configuration
        .MinimumLevel.Information()
        .Enrich.FromLogContext()
        .WriteTo.Console();

    var appInsightsConnection = context.Configuration["APPLICATIONINSIGHTS_CONNECTION_STRING"];
    if (!string.IsNullOrWhiteSpace(appInsightsConnection))
    {
        configuration.WriteTo.ApplicationInsights(appInsightsConnection, new TraceTelemetryConverter());
    }
});

// --- Services ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));
builder.Services.AddAuthorization();

builder.Services.AddDbContext<TeamPollDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Db")));

builder.Services.AddScoped<IPollService, PollService>();

const string SpaCorsPolicy = "SpaCors";
builder.Services.AddCors(options => options.AddPolicy(SpaCorsPolicy, policy =>
{
    var allowedOrigins = builder.Configuration.GetSection("Api:AllowedOrigins").Get<string[]>() ?? [];
    policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
}));

var app = builder.Build();

// --- Pipeline (order per api-performance.md) ---
app.UseExceptionHandler();
app.UseMiddleware<OperationIdMiddleware>();      // correlation id first, before auth/logging
app.UseMiddleware<SecurityHeadersMiddleware>();  // headers + Cache-Control on every response
app.UseHttpsRedirection();
app.UseCors(SpaCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.UseSerilogRequestLogging();
app.UseMiddleware<EnsureUserMiddleware>();        // after authz; provisions dbo.Users

if (app.Configuration.GetValue<bool>("Swagger:Enabled"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();

/// <summary>Exposed so the integration test project can drive the app via WebApplicationFactory.</summary>
public partial class Program;
