using ParkAtBlock.Configuration;
using ParkAtBlock.Hubs;
using ParkAtBlock.Repositories;
using ParkAtBlock.Services;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();
builder.Services.Configure<ParkingSettings>(builder.Configuration.GetSection(ParkingSettings.SectionName));
builder.Services.AddSingleton<IParkingStateRepository, InMemoryParkingStateRepository>();
builder.Services.AddSingleton<IParkingService, ParkingService>();
builder.Services.AddSignalR();

var allowedOrigins = builder.Configuration.GetSection("ParkingSettings:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddPolicy("Dashboard", policy =>
{
    policy.WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
}));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
        options.SwaggerEndpoint("/openapi/v1.json", "ParkAtBlock API v1"));
}

app.UseHttpsRedirection();

app.UseCors("Dashboard");

app.MapGet("/health", () => Results.Ok(new { status = "Healthy" }));
app.MapControllers();
app.MapHub<ParkingHub>("/hubs/parking");

app.Run();

public partial class Program { }
