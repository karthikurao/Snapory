import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types
export interface AuthResponse {
  userId: string;
  email: string;
  name: string;
  token: string;
  expiresAt: string;
}

export interface User {
  userId: string;
  email: string;
  name: string;
  companyName?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Event {
  eventId: string;
  name: string;
  description?: string;
  eventDate?: string;
  location?: string;
  guestAccessCode: string;
  uploadToken?: string;
  totalPhotos: number;
  processedPhotos: number;
  totalFacesDetected: number;
  isProcessingComplete: boolean;
  isActive: boolean;
  createdAt: string;
  photos?: Photo[];
}

export interface Photo {
  photoId: string;
  fileName: string;
  fileSize: number;
  thumbnailUrl: string;
  processingStatus: string;
  faceCount: number;
  uploadedAt: string;
}

export interface PhotoUploadResponse {
  photos: {
    photoId: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  }[];
}

export interface GuestJoinResponse {
  sessionId: string;
  eventName: string;
  eventDate?: string;
  location?: string;
  totalPhotos: number;
  isProcessingComplete: boolean;
}

export interface PhotoMatch {
  photoId: string;
  thumbnailUrl: string;
  fullUrl: string;
  confidence: number;
  uploadedAt: string;
}

export interface PhotoMatchResponse {
  sessionId: string;
  totalMatches: number;
  photos: PhotoMatch[];
}

export interface EventStats {
  totalPhotos: number;
  processedPhotos: number;
  pendingPhotos: number;
  failedPhotos: number;
  totalFaces: number;
  totalGuests: number;
  matchedGuests: number;
  totalDownloads: number;
  isProcessingComplete: boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }

    // Add auth interceptor
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  // Auth methods
  async register(email: string, password: string, name: string, companyName?: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
      companyName,
    });
    this.setToken(response.data.token);
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    this.setToken(response.data.token);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get<User>('/auth/profile');
    return response.data;
  }

  logout(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  // Event methods
  async createEvent(data: {
    name: string;
    description?: string;
    eventDate?: string;
    location?: string;
  }): Promise<{ eventId: string; uploadToken: string; guestAccessCode: string; createdAt: string }> {
    const response = await this.client.post('/events', data);
    return response.data;
  }

  async getEvents(): Promise<Event[]> {
    const response = await this.client.get<Event[]>('/events');
    return response.data;
  }

  async getEvent(eventId: string): Promise<Event> {
    const response = await this.client.get<Event>(`/events/${eventId}`);
    return response.data;
  }

  async updateEvent(eventId: string, data: Partial<Event>): Promise<void> {
    await this.client.put(`/events/${eventId}`, data);
  }

  async regenerateAccessCode(eventId: string): Promise<{ guestAccessCode: string }> {
    const response = await this.client.post(`/events/${eventId}/regenerate-code`);
    return response.data;
  }

  async getEventStats(eventId: string): Promise<EventStats> {
    const response = await this.client.get<EventStats>(`/events/${eventId}/stats`);
    return response.data;
  }

  // Photo methods
  async uploadPhotos(eventId: string, files: File[], uploadToken?: string): Promise<PhotoUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    };
    
    if (uploadToken) {
      headers['X-Upload-Token'] = uploadToken;
    }

    const response = await this.client.post<PhotoUploadResponse>(
      `/events/${eventId}/photos`,
      formData,
      { headers }
    );

    return response.data;
  }

  async downloadPhoto(eventId: string, photoId: string): Promise<{ downloadUrl: string; fileName: string }> {
    const response = await this.client.get(`/events/${eventId}/photos/${photoId}/download`);
    return response.data;
  }

  async deletePhoto(eventId: string, photoId: string): Promise<void> {
    await this.client.delete(`/events/${eventId}/photos/${photoId}`);
  }

  // Guest methods
  async joinEvent(accessCode: string): Promise<GuestJoinResponse> {
    const response = await this.client.post<GuestJoinResponse>(`/guests/join/${accessCode}`);
    return response.data;
  }

  async uploadSelfie(sessionId: string, selfie: File): Promise<{ sessionId: string; status: string; message: string }> {
    const formData = new FormData();
    formData.append('selfie', selfie);

    const response = await this.client.post(`/guests/${sessionId}/selfie`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  }

  async findMatchingPhotos(sessionId: string): Promise<PhotoMatchResponse> {
    const response = await this.client.post<PhotoMatchResponse>(`/guests/${sessionId}/find-photos`);
    return response.data;
  }

  async getMatchedPhotos(sessionId: string): Promise<PhotoMatchResponse> {
    const response = await this.client.get<PhotoMatchResponse>(`/guests/${sessionId}/photos`);
    return response.data;
  }

  async downloadGuestPhoto(sessionId: string, photoId: string): Promise<{ downloadUrl: string; fileName: string }> {
    const response = await this.client.get(`/guests/${sessionId}/photos/${photoId}/download`);
    return response.data;
  }

  async downloadAllGuestPhotos(sessionId: string): Promise<{ totalPhotos: number; photos: { photoId: string; fileName: string; downloadUrl: string }[] }> {
    const response = await this.client.get(`/guests/${sessionId}/download-all`);
    return response.data;
  }

  // Health check
  async checkHealth(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
