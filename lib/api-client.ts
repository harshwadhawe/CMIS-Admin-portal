// API client utility for making authenticated requests

const API_BASE_URL = "/api";

export interface ApiError {
  success: false;
  error: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/**
 * Get the JWT token from localStorage
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const auth = localStorage.getItem("token");
  if (!auth) return null;

  try {
    return auth || null;
  } catch {
    return null;
  }
}

/**
 * Store the JWT token in localStorage
 */
export function setToken(token: string, user: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    "token",
    JSON.stringify({
      token,
      user,
      timestamp: Date.now(),
    })
  );
}

/**
 * Remove the token from localStorage
 */
export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers = new Headers(options.headers || {});

  // Set JSON content-type by default, unless we're sending FormData
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Add authorization header if token exists
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    // If unauthorized, clear token and redirect to login
    if (response.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }

    return data;
  } catch (error) {
    console.error("API request error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * API client methods
 */
export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const response = await apiRequest<{
      token: string;
      user: any;
      expiresIn: number;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (response.success) {
      setToken(response.data.token, response.data.user);
    }

    return response;
  },

  logout: () => {
    removeToken();
  },

  // Events
  getEvents: () => apiRequest<any[]>("/events"),

  getEventById: (id: string) => apiRequest<any>(`/events/${id}`),

  createEvent: (event: {
    title: string;
    description: string;
    pdfFile?: File | null;
    eventDate?: string;
    locationType?: string;
    startTime?: string;
    endTime?: string;
  }) =>
    apiRequest<any>("/events", {
      method: "POST",
      body: (() => {
        if (event.pdfFile) {
          const formData = new FormData();
          formData.append("title", event.title);
          formData.append("description", event.description);
          formData.append("pdfFile", event.pdfFile);
          if (event.eventDate) {
            formData.append("eventDate", event.eventDate);
          }
          if (event.locationType) {
            formData.append("locationType", event.locationType);
          }
          if (event.startTime) {
            formData.append("startTime", event.startTime);
          }
          if (event.endTime) {
            formData.append("endTime", event.endTime);
          }
          return formData;
        }
        return JSON.stringify({
          title: event.title,
          description: event.description,
          eventDate: event.eventDate,
          locationType: event.locationType,
          startTime: event.startTime,
          endTime: event.endTime,
        });
      })(),
    }),

  // External Stakeholders (formerly Judges)
  getJudges: (filters?: { id?: string; esType?: string }) => {
    const params = new URLSearchParams();
    if (filters?.id) params.append("id", filters.id);
    if (filters?.esType) params.append("es_type", filters.esType);

    const query = params.toString();
    return apiRequest<any[]>(`/judges${query ? `?${query}` : ""}`);
  },

  getJudgeById: (id: string) => apiRequest<any>(`/judges/${id}`),

  updateJudge: (
    id: string,
    judge: {
      esType?: string;
      fullName?: string;
      email?: string;
      phone?: string;
      organization?: string;
      title?: string;
      location?: string;
      graduationYear?: number;
      linkedinUrl?: string;
      bioText?: string;
      bioEmbedding?: string;
    }
  ) =>
    apiRequest<any>(`/judges/${id}`, {
      method: "PUT",
      body: JSON.stringify(judge),
    }),

  deleteJudge: (id: string) =>
    apiRequest<any>(`/judges/${id}`, {
      method: "DELETE",
    }),

  // N8n
  triggerEmail: (payload: {
    eventId?: string;
    eventTitle?: string;
    recipients?: number[];
    subject?: string;
    template?: string;
  }) =>
    apiRequest<any>("/n8n/email-trigger", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Generic N8n workflow trigger
  triggerWorkflow: (payload: {
    eventId: string;
    type?: string;
    payload?: any;
  }) =>
    apiRequest<any>("/n8n/workflow-trigger", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Event Judges
  getEventJudges: (eventId: string) =>
    apiRequest<any[]>(`/events/${eventId}/judges`, {
      method: "GET",
    }),

  associateJudgeWithEvent: (eventId: string, esId: string) =>
    apiRequest<any>(`/events/${eventId}/judges`, {
      method: "POST",
      body: JSON.stringify({ esId }),
    }),

  removeJudgeFromEvent: (eventId: string, esId: string) =>
    apiRequest<any>(`/events/${eventId}/judges?esId=${esId}`, {
      method: "DELETE",
    }),

  // Outreach Emails
  getOutreachEmailsByEvent: (eventId: string) =>
    apiRequest<any[]>(`/outreach-emails?event_id=${eventId}`),

  getOutreachEmailsByStakeholder: (esId: string) =>
    apiRequest<any[]>(`/outreach-emails?es_id=${esId}`),

  getOutreachEmailsByEventAndStakeholder: (eventId: string, esId: string) =>
    apiRequest<any[]>(`/outreach-emails?event_id=${eventId}&es_id=${esId}`),

  getOutreachEmailById: (id: string) =>
    apiRequest<any>(`/outreach-emails/${id}`),

  createOutreachEmail: (email: {
    eventId: string;
    esId: string;
    subject?: string;
    body?: string;
    status?: string;
    scheduledSendAt?: string;
  }) =>
    apiRequest<any>("/outreach-emails", {
      method: "POST",
      body: JSON.stringify(email),
    }),

  updateOutreachEmail: (
    id: string,
    updates: {
      subject?: string;
      body?: string;
      to?: string;
    }
  ) =>
    apiRequest<any>(`/outreach-emails/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  deleteOutreachEmail: (id: string) =>
    apiRequest<any>(`/outreach-emails/${id}`, {
      method: "DELETE",
    }),

  // Mentor Emails
  getMentorEmails: (filters?: {
    studentId?: string;
    esId?: string;
    id?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.studentId) params.append('student_id', filters.studentId);
    if (filters?.esId) params.append('es_id', filters.esId);
    if (filters?.id) params.append('id', filters.id);
    const queryString = params.toString();
    return apiRequest<any[]>(`/mentor-emails${queryString ? `?${queryString}` : ''}`);
  },

  getMentorEmailById: (id: string) =>
    apiRequest<any>(`/mentor-emails/${id}`),

  createMentorEmail: (email: {
    studentId: string;
    esId: string;
    subject?: string;
    body?: string;
    status?: string;
    scheduledSendAt?: string;
    sentBy?: number;
    createdBy?: number;
  }) =>
    apiRequest<any>("/mentor-emails", {
      method: "POST",
      body: JSON.stringify(email),
    }),

  updateMentorEmail: (
    id: string,
    updates: {
      subject?: string;
      body?: string;
      status?: string;
      scheduledSendAt?: string;
      sentBy?: number;
      updatedBy?: number;
    }
  ) =>
    apiRequest<any>(`/mentor-emails/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  deleteMentorEmail: (id: string) =>
    apiRequest<any>(`/mentor-emails/${id}`, {
      method: "DELETE",
    }),

  // Get mentor emails by external stakeholder ID
  getMentorEmailsByStakeholder: (esId: string) =>
    apiRequest<{
      stakeholder: {
        esId: string;
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
        bioEmbedding?: string;
        expertise?: string;
      };
      mentorEmails: Array<{
        id: string;
        studentId: string;
        esId: string;
        subject?: string;
        body?: string;
        status: string;
        scheduledSendAt?: string;
        sentBy?: string;
        createdBy?: string;
        updatedBy?: string;
        createdAt: string;
        updatedAt: string;
        student: any; // Full student details
      }>;
    }>(`/mentors/${esId}/emails`),

  // Update mentor email by external stakeholder ID
  updateMentorEmailByStakeholder: (
    esId: string,
    updates: {
      subject?: string;
      body?: string;
      email?: string; // email to update in external_stakeholders table
    }
  ) =>
    apiRequest<{
      stakeholder: {
        esId: string;
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
        bioEmbedding?: string;
        expertise?: string;
      };
      status: string;
    }>(`/mentors/${esId}/emails`, {
      method: "POST",
      body: JSON.stringify(updates),
    }),

  // Students
  getStudents: (filters?: { id?: string }) => {
    const params = new URLSearchParams();
    if (filters?.id) params.append('id', filters.id);
    const queryString = params.toString();
    return apiRequest<any[]>(`/students${queryString ? `?${queryString}` : ''}`);
  },

  getStudentById: (id: string) =>
    apiRequest<any>(`/students?id=${id}`),

  createStudent: (student: {
    uin?: string;
    email: string;
    name: string;
    degreeType?: string;
    academicLevel?: string;
    programOfStudy?: string;
    graduationYear?: number;
    needMentorship?: boolean;
    domainInterests?: string;
    targetIndustries?: string;
    resumePath?: string;
    resumePathKey?: string;
    profileSummary?: string;
    profileSummaryEmbedding?: string;
    linkedinUrl?: string;
    gpa?: number;
    skills?: string;
    password?: string;
      isRegistered?: boolean;
    }) =>
    apiRequest<any>("/students", {
      method: "POST",
      body: JSON.stringify(student),
    }),

  // N8n Mentor Matching Trigger
  triggerMentorMatching: (payload: {
    esId: string;
    studentId: string;
  }) =>
    apiRequest<{
      success: boolean;
      n8nResponse: any;
      payload: {
        esId: string;
        studentId: string;
        mentor: any;
        student: any;
        triggeredByUserId?: string;
        triggeredAt: string;
      };
    }>("/n8n/mentor-matching-trigger", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
