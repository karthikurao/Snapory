import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface PhotoUploadResponse {
  photoId: string;
  fileName: string;
  storageUrl: string;
  sizeInBytes: number;
  uploadedAt: string;
  status: string;
}

export interface PhotoResponse {
  id: string;
  fileName: string;
  storageUrl: string;
  sizeInBytes: number;
  uploadedAt: string;
  eventId?: string;
  status: string;
}

class ApiClient {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async uploadPhoto(file: File, eventId?: string): Promise<PhotoUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (eventId) {
      formData.append('eventId', eventId);
    }

    const response = await this.client.post<PhotoUploadResponse>(
      '/photos/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  async getPhoto(photoId: string): Promise<PhotoResponse> {
    const response = await this.client.get<PhotoResponse>(`/photos/${photoId}`);
    return response.data;
  }

  async getEventPhotos(eventId: string): Promise<PhotoResponse[]> {
    const response = await this.client.get<PhotoResponse[]>(`/photos/event/${eventId}`);
    return response.data;
  }

  async checkHealth(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
