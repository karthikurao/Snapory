namespace SnaporyIngest.Models;

public class CreateEventRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? EventDate { get; set; }
    public string? Location { get; set; }
}
