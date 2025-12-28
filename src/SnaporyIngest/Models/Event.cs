using System.Security.Cryptography;

namespace SnaporyIngest.Models;

public class Event
{
    public string EventId { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;  // Owner (photographer)
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EventDate { get; set; }
    public string? Location { get; set; }
    public string UploadToken { get; set; } = Guid.NewGuid().ToString();
    public string GuestAccessCode { get; set; } = GenerateAccessCode();
    public bool IsActive { get; set; } = true;
    public bool IsProcessingComplete { get; set; } = false;
    public int TotalPhotos { get; set; } = 0;
    public int ProcessedPhotos { get; set; } = 0;
    public int TotalFacesDetected { get; set; } = 0;
    
    public User? User { get; set; }
    public ICollection<Photo> Photos { get; set; } = new List<Photo>();
    public ICollection<GuestSession> GuestSessions { get; set; } = new List<GuestSession>();
    
    private static string GenerateAccessCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var code = new char[6];
        
        using (var rng = RandomNumberGenerator.Create())
        {
            for (int i = 0; i < 6; i++)
            {
                byte randomByte;
                do
                {
                    var buffer = new byte[1];
                    rng.GetBytes(buffer);
                    randomByte = buffer[0];
                } while (randomByte >= 256 - (256 % chars.Length));
                
                code[i] = chars[randomByte % chars.Length];
            }
        }
        
        return new string(code);
    }
}
