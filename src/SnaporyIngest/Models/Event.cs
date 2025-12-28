namespace SnaporyIngest.Models;

using System.Security.Cryptography;

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
        // Generate a 6-character alphanumeric code using cryptographically secure random
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var code = new char[6];
        
        for (int i = 0; i < code.Length; i++)
        {
            code[i] = chars[RandomNumberGenerator.GetInt32(chars.Length)];
        }
        
        return new string(code);
    }
}
