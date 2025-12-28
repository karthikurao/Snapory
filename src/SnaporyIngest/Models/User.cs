namespace SnaporyIngest.Models;

public class User
{
    public string UserId { get; set; } = Guid.NewGuid().ToString();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public UserRole Role { get; set; } = UserRole.Photographer;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsEmailVerified { get; set; } = false;
    public string? EmailVerificationToken { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetExpiry { get; set; }
    
    public ICollection<Event> Events { get; set; } = new List<Event>();
}

public enum UserRole
{
    Photographer = 0,
    Admin = 1
}
