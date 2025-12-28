namespace SnaporyIngest.Models;

public class Event
{
    public string EventId { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EventDate { get; set; }
    public string? Location { get; set; }
    public string UploadToken { get; set; } = Guid.NewGuid().ToString();
    public string GuestAccessCode { get; set; } = GenerateAccessCode();
    public bool IsActive { get; set; } = true;
    
    public ICollection<Photo> Photos { get; set; } = new List<Photo>();
    public ICollection<GuestFace> GuestFaces { get; set; } = new List<GuestFace>();
    
    private static string GenerateAccessCode()
    {
        // Generate a 6-character alphanumeric code
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return new string(Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }
}
