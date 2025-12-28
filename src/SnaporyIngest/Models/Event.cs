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
            var randomBytes = new byte[6];
            rng.GetBytes(randomBytes);
            
            for (int i = 0; i < 6; i++)
            {
                // Use rejection sampling to ensure uniform distribution
                int value;
                do
                {
                    value = randomBytes[i];
                    if (value >= 256 - (256 % chars.Length))
                    {
                        // Rejection sampling: get a new byte if this would introduce bias
                        var newByte = new byte[1];
                        rng.GetBytes(newByte);
                        randomBytes[i] = newByte[0];
                    }
                    else
                    {
                        break;
                    }
                } while (true);
                
                code[i] = chars[value % chars.Length];
            }
        }
        
        return new string(code);
    }
}
