namespace Snapory.Application.DTOs;

// Event DTOs
public class CreateEventRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class CreateEventResponse
{
    public string EventId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string UploadToken { get; set; } = string.Empty;
    public string QrCodeData { get; set; } = string.Empty;
    public string EventUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class EventResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string QrCodeData { get; set; } = string.Empty;
    public string EventUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int PhotoCount { get; set; }
    public int GuestCount { get; set; }
}

public class EventDetailsResponse : EventResponse
{
    public List<PhotoResponse> Photos { get; set; } = new();
    public List<GuestResponse> Guests { get; set; } = new();
}

// Guest DTOs
public class GuestRegistrationRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Name { get; set; }
}

public class GuestVerificationRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
}

public class GuestResponse
{
    public Guid Id { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Name { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }
}

// OTP DTOs
public class SendOtpRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
}

public class SendOtpResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class VerifyOtpRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
}

public class VerifyOtpResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid? GuestId { get; set; }
    public string? AccessToken { get; set; }
}

// Photographer DTOs
public class RegisterPhotographerRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string PhotographerId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
