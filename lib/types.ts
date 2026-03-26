// Type definitions for the CMIS Admin Portal API

export interface User {
  id: string;
  username: string;
  email?: string;
  password?: string; // Hashed password, should not be returned in API responses
  role?: string;
  createdAt?: Date;
}

export interface Event {
  id: string; // Maps to event_id in database
  title: string;
  description: string;
  eventDate?: Date | string;
  startTime?: string;
  endTime?: string;
  locationType?: string;
  fileName?: string;
  eventSummary?: string;
  eventEmbedding?: string; // Could be JSON string or vector embedding
  fileKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface ExternalStakeholder {
  id: string; // Maps to es_id in database
  esType: string;
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  title?: string;
  location?: string;
  graduationYear?: number;
  linkedinUrl?: string;
  bioText?: string;
  bioEmbedding?: string; // Could be JSON string or vector embedding
}

// Keep Judge as alias for backward compatibility if needed
export type Judge = ExternalStakeholder;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    role?: string;
  };
  expiresIn: number; // in seconds (10 hours = 36000)
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface N8nWebhookPayload {
  eventId: string;
  eventTitle: string;
  recipients: string[];
  subject?: string;
  template?: string;
}

