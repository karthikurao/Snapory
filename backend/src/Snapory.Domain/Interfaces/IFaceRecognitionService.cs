namespace Snapory.Domain.Interfaces;

public interface IFaceRecognitionService
{
    Task<string> ExtractFaceEmbeddingAsync(Stream imageStream, CancellationToken cancellationToken = default);
    Task<List<(string embedding, string boundingBox)>> DetectFacesAsync(Stream imageStream, CancellationToken cancellationToken = default);
    Task<(Guid? guestId, float? confidence)> FindMatchingGuestAsync(string faceEmbedding, string eventId, CancellationToken cancellationToken = default);
    float CompareFaces(string embedding1, string embedding2);
}
