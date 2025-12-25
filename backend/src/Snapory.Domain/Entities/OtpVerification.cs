namespace Snapory.Domain.Entities;

public class OtpVerification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PhoneNumber { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddMinutes(10);
    public bool IsUsed { get; set; }
    public int AttemptCount { get; set; }
}
