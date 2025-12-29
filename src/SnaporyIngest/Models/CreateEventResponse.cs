namespace SnaporyIngest.Models;

public class CreateEventResponse
{
    public string EventId { get; set; } = string.Empty;
    public string UploadToken { get; set; } = string.Empty;
    public string GuestAccessCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
