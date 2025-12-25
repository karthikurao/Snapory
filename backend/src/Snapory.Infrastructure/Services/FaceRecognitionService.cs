using Microsoft.Extensions.Logging;
using Snapory.Domain.Interfaces;
using System.Net.Http.Json;
using System.Text.Json;

namespace Snapory.Infrastructure.Services;

public class FaceRecognitionService : IFaceRecognitionService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<FaceRecognitionService> _logger;
    private readonly IGuestRepository _guestRepository;
    private const float MATCH_THRESHOLD = 0.6f;

    public FaceRecognitionService(
        IHttpClientFactory httpClientFactory, 
        ILogger<FaceRecognitionService> logger,
        IGuestRepository guestRepository)
    {
        _httpClient = httpClientFactory.CreateClient("AiService");
        _logger = logger;
        _guestRepository = guestRepository;
    }

    public async Task<string> ExtractFaceEmbeddingAsync(Stream imageStream, CancellationToken cancellationToken = default)
    {
        try
        {
            using var content = new MultipartFormDataContent();
            var streamContent = new StreamContent(imageStream);
            streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
            content.Add(streamContent, "file", "image.jpg");

            var response = await _httpClient.PostAsync("/api/face/extract-embedding", content, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<FaceEmbeddingResponse>(cancellationToken: cancellationToken);
            
            if (result?.Embedding == null)
            {
                throw new InvalidOperationException("No face embedding returned from AI service");
            }

            return result.Embedding;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting face embedding");
            throw;
        }
    }

    public async Task<List<(string embedding, string boundingBox)>> DetectFacesAsync(Stream imageStream, CancellationToken cancellationToken = default)
    {
        try
        {
            using var content = new MultipartFormDataContent();
            var streamContent = new StreamContent(imageStream);
            streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
            content.Add(streamContent, "file", "image.jpg");

            var response = await _httpClient.PostAsync("/api/face/detect", content, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<FaceDetectionResponse>(cancellationToken: cancellationToken);
            
            if (result?.Faces == null)
            {
                return new List<(string, string)>();
            }

            return result.Faces.Select(f => (f.Embedding, f.BoundingBox)).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error detecting faces");
            throw;
        }
    }

    public async Task<(Guid? guestId, float? confidence)> FindMatchingGuestAsync(string faceEmbedding, string eventId, CancellationToken cancellationToken = default)
    {
        try
        {
            var guests = await _guestRepository.GetByEventIdAsync(eventId, cancellationToken);
            
            Guid? bestMatchId = null;
            float? bestConfidence = null;

            foreach (var guest in guests)
            {
                if (string.IsNullOrEmpty(guest.FaceEmbedding))
                    continue;

                var similarity = CompareFaces(faceEmbedding, guest.FaceEmbedding);
                
                if (similarity >= MATCH_THRESHOLD && (bestConfidence == null || similarity > bestConfidence))
                {
                    bestMatchId = guest.Id;
                    bestConfidence = similarity;
                }
            }

            return (bestMatchId, bestConfidence);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finding matching guest");
            throw;
        }
    }

    public float CompareFaces(string embedding1, string embedding2)
    {
        try
        {
            var vec1 = JsonSerializer.Deserialize<float[]>(embedding1);
            var vec2 = JsonSerializer.Deserialize<float[]>(embedding2);

            if (vec1 == null || vec2 == null || vec1.Length != vec2.Length)
            {
                return 0f;
            }

            // Calculate cosine similarity
            float dotProduct = 0f;
            float magnitude1 = 0f;
            float magnitude2 = 0f;

            for (int i = 0; i < vec1.Length; i++)
            {
                dotProduct += vec1[i] * vec2[i];
                magnitude1 += vec1[i] * vec1[i];
                magnitude2 += vec2[i] * vec2[i];
            }

            magnitude1 = (float)Math.Sqrt(magnitude1);
            magnitude2 = (float)Math.Sqrt(magnitude2);

            if (magnitude1 == 0 || magnitude2 == 0)
                return 0f;

            return dotProduct / (magnitude1 * magnitude2);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error comparing face embeddings");
            return 0f;
        }
    }

    private class FaceEmbeddingResponse
    {
        public string? Embedding { get; set; }
    }

    private class FaceDetectionResponse
    {
        public List<DetectedFace>? Faces { get; set; }
    }

    private class DetectedFace
    {
        public string Embedding { get; set; } = string.Empty;
        public string BoundingBox { get; set; } = string.Empty;
    }
}
