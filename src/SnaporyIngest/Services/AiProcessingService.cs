using System.Text.Json;

namespace SnaporyIngest.Services;

public interface IAiProcessingService
{
    Task<double[]?> EncodeFaceAsync(string imageUrl);
    Task<FaceDetectionResult?> DetectFacesAsync(string imageUrl);
    Task<List<FaceMatch>> MatchFacesAsync(double[] faceEncoding, List<PhotoFaceData> photoFaces);
}

public class AiProcessingService : IAiProcessingService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AiProcessingService> _logger;
    private readonly string _aiServiceUrl;

    public AiProcessingService(HttpClient httpClient, IConfiguration configuration, ILogger<AiProcessingService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _aiServiceUrl = configuration["AiService:Url"] ?? "http://localhost:8000";
    }

    public async Task<double[]?> EncodeFaceAsync(string imageUrl)
    {
        try
        {
            var request = new { image_url = imageUrl };
            var response = await _httpClient.PostAsJsonAsync($"{_aiServiceUrl}/api/encode-selfie", request);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI service returned {StatusCode} for encode-selfie", response.StatusCode);
                return null;
            }

            var result = await response.Content.ReadFromJsonAsync<EncodeSelfieResponse>();
            return result?.Encoding;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to encode face");
            return null;
        }
    }

    public async Task<FaceDetectionResult?> DetectFacesAsync(string imageUrl)
    {
        try
        {
            var request = new { image_url = imageUrl };
            var response = await _httpClient.PostAsJsonAsync($"{_aiServiceUrl}/api/detect-faces", request);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI service returned {StatusCode} for detect-faces", response.StatusCode);
                return null;
            }

            return await response.Content.ReadFromJsonAsync<FaceDetectionResult>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to detect faces");
            return null;
        }
    }

    public async Task<List<FaceMatch>> MatchFacesAsync(double[] faceEncoding, List<PhotoFaceData> photoFaces)
    {
        try
        {
            var request = new
            {
                target_encoding = faceEncoding,
                photo_faces = photoFaces.Select(pf => new
                {
                    photo_id = pf.PhotoId,
                    face_id = pf.FaceId,
                    encoding = pf.Encoding
                }).ToList()
            };

            var response = await _httpClient.PostAsJsonAsync($"{_aiServiceUrl}/api/match-faces", request);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI service returned {StatusCode} for match-faces", response.StatusCode);
                return new List<FaceMatch>();
            }

            var result = await response.Content.ReadFromJsonAsync<MatchFacesResponse>();
            return result?.Matches ?? new List<FaceMatch>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to match faces");
            return new List<FaceMatch>();
        }
    }
}

public class EncodeSelfieResponse
{
    public double[]? Encoding { get; set; }
    public bool FaceDetected { get; set; }
}

public class FaceDetectionResult
{
    public int FaceCount { get; set; }
    public List<DetectedFace> Faces { get; set; } = new();
}

public class DetectedFace
{
    public int Index { get; set; }
    public double[] Encoding { get; set; } = Array.Empty<double>();
    public FaceBoundingBox BoundingBox { get; set; } = new();
}

public class FaceBoundingBox
{
    public double Top { get; set; }
    public double Right { get; set; }
    public double Bottom { get; set; }
    public double Left { get; set; }
}

public class MatchFacesResponse
{
    public List<FaceMatch> Matches { get; set; } = new();
}

public class FaceMatch
{
    public string PhotoId { get; set; } = string.Empty;
    public string FaceId { get; set; } = string.Empty;
    public double Distance { get; set; }
    public double Confidence { get; set; }
}

public class PhotoFaceData
{
    public string PhotoId { get; set; } = string.Empty;
    public string FaceId { get; set; } = string.Empty;
    public double[] Encoding { get; set; } = Array.Empty<double>();
}
