using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using SnaporyIngest.Services;

namespace SnaporyIngest.Middleware;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AuthorizeAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Check if action has [AllowAnonymous]
        var allowAnonymous = context.ActionDescriptor.EndpointMetadata
            .Any(em => em.GetType() == typeof(AllowAnonymousAttribute));
        
        if (allowAnonymous)
            return;

        // Check for user in context (set by middleware)
        var user = context.HttpContext.Items["User"];
        if (user == null)
        {
            context.Result = new UnauthorizedObjectResult(new { error = "Unauthorized" });
        }
    }
}

[AttributeUsage(AttributeTargets.Method)]
public class AllowAnonymousAttribute : Attribute { }

public class JwtMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<JwtMiddleware> _logger;

    public JwtMiddleware(RequestDelegate next, ILogger<JwtMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IAuthService authService)
    {
        var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

        if (token != null)
        {
            var userId = authService.ValidateToken(token);
            if (userId != null)
            {
                // Attach user to context
                var user = await authService.GetUserByIdAsync(userId);
                if (user != null)
                {
                    context.Items["User"] = user;
                    context.Items["UserId"] = userId;
                    
                    // Add claims for easy access
                    var claims = new List<Claim>
                    {
                        new(ClaimTypes.NameIdentifier, user.UserId),
                        new(ClaimTypes.Email, user.Email),
                        new(ClaimTypes.Name, user.Name)
                    };
                    var identity = new ClaimsIdentity(claims, "jwt");
                    context.User = new ClaimsPrincipal(identity);
                }
            }
        }

        await _next(context);
    }
}

public static class HttpContextExtensions
{
    public static string? GetUserId(this HttpContext context)
    {
        return context.Items["UserId"] as string;
    }

    public static T? GetUser<T>(this HttpContext context) where T : class
    {
        return context.Items["User"] as T;
    }
}
