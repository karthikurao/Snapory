using Snapory.Application.DTOs;
using Snapory.Domain.Entities;
using Snapory.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace Snapory.Application.Services;

public interface IGuestService
{
    Task<SendOtpResponse> SendOtpAsync(SendOtpRequest request, CancellationToken cancellationToken = default);
    Task<VerifyOtpResponse> VerifyOtpAndRegisterAsync(VerifyOtpRequest request, Stream selfieStream, CancellationToken cancellationToken = default);
    Task<IEnumerable<PhotoResponse>> GetGuestPhotosAsync(string eventId, Guid guestId, CancellationToken cancellationToken = default);
}

public class GuestService : IGuestService
{
    private readonly IGuestRepository _guestRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IPhotoRepository _photoRepository;
    private readonly IOtpService _otpService;
    private readonly IFaceRecognitionService _faceRecognitionService;
    private readonly IStorageService _storageService;
    private readonly ILogger<GuestService> _logger;

    public GuestService(
        IGuestRepository guestRepository,
        IEventRepository eventRepository,
        IPhotoRepository photoRepository,
        IOtpService otpService,
        IFaceRecognitionService faceRecognitionService,
        IStorageService storageService,
        ILogger<GuestService> logger)
    {
        _guestRepository = guestRepository;
        _eventRepository = eventRepository;
        _photoRepository = photoRepository;
        _otpService = otpService;
        _faceRecognitionService = faceRecognitionService;
        _storageService = storageService;
        _logger = logger;
    }

    public async Task<SendOtpResponse> SendOtpAsync(SendOtpRequest request, CancellationToken cancellationToken = default)
    {
        // Verify event exists
        var eventEntity = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken);
        if (eventEntity == null)
        {
            return new SendOtpResponse
            {
                Success = false,
                Message = "Event not found"
            };
        }

        try
        {
            var otpCode = await _otpService.GenerateOtpAsync(request.PhoneNumber, request.EventId, cancellationToken);
            await _otpService.SendOtpAsync(request.PhoneNumber, otpCode, cancellationToken);

            _logger.LogInformation("Sent OTP to {PhoneNumber} for event {EventId}", request.PhoneNumber, request.EventId);

            return new SendOtpResponse
            {
                Success = true,
                Message = "OTP sent successfully"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending OTP");
            return new SendOtpResponse
            {
                Success = false,
                Message = "Failed to send OTP"
            };
        }
    }

    public async Task<VerifyOtpResponse> VerifyOtpAndRegisterAsync(VerifyOtpRequest request, Stream selfieStream, CancellationToken cancellationToken = default)
    {
        // Verify OTP
        var isValid = await _otpService.VerifyOtpAsync(request.PhoneNumber, request.EventId, request.OtpCode, cancellationToken);
        
        if (!isValid)
        {
            return new VerifyOtpResponse
            {
                Success = false,
                Message = "Invalid or expired OTP"
            };
        }

        // Check if guest already exists
        var existingGuest = await _guestRepository.GetByPhoneAndEventAsync(request.PhoneNumber, request.EventId, cancellationToken);
        if (existingGuest != null)
        {
            return new VerifyOtpResponse
            {
                Success = true,
                Message = "Guest already registered",
                GuestId = existingGuest.Id
            };
        }

        try
        {
            // Extract face embedding from selfie
            var faceEmbedding = await _faceRecognitionService.ExtractFaceEmbeddingAsync(selfieStream, cancellationToken);
            
            // Reset stream position for storage
            selfieStream.Position = 0;
            
            // Upload selfie to storage
            var fileName = $"selfies/{request.EventId}/{Guid.NewGuid()}.jpg";
            var selfieKey = await _storageService.UploadPhotoAsync(selfieStream, fileName, "image/jpeg", cancellationToken);

            // Create guest record
            var guest = new Guest
            {
                EventId = request.EventId,
                PhoneNumber = request.PhoneNumber,
                SelfieStorageKey = selfieKey,
                FaceEmbedding = faceEmbedding,
                IsVerified = true
            };

            await _guestRepository.CreateAsync(guest, cancellationToken);

            _logger.LogInformation("Registered guest {GuestId} for event {EventId}", guest.Id, request.EventId);

            return new VerifyOtpResponse
            {
                Success = true,
                Message = "Guest registered successfully",
                GuestId = guest.Id
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering guest");
            return new VerifyOtpResponse
            {
                Success = false,
                Message = "Failed to register guest"
            };
        }
    }

    public async Task<IEnumerable<PhotoResponse>> GetGuestPhotosAsync(string eventId, Guid guestId, CancellationToken cancellationToken = default)
    {
        var photos = await _photoRepository.GetByGuestAsync(guestId, cancellationToken);
        
        return photos
            .Where(p => p.EventId == eventId)
            .Select(p => new PhotoResponse
            {
                Id = p.Id,
                FileName = p.FileName,
                StorageUrl = p.StorageUrl,
                SizeInBytes = p.SizeInBytes,
                UploadedAt = p.UploadedAt,
                EventId = p.EventId,
                Status = p.Status.ToString()
            });
    }
}
