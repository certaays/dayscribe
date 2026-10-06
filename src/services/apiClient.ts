/* ============================================================
   DayScribe — Backend API Client & Cloud Synchronization Layer
   ============================================================ */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface SyncPayload {
  journalEntries?: any[];
  habits?: any[];
  habitLogs?: any[];
  reminders?: any[];
  reminderLogs?: any[];
  settings?: any;
}

export interface SyncResult {
  journalEntries: any[];
  habits: any[];
  habitLogs: any[];
  reminders: any[];
  reminderLogs: any[];
  settings: any;
  syncedAt: string;
}

class ApiClient {
  private baseUrl: string;
  private tokenKey = 'dayscribe_jwt_token';

  constructor() {
    // In dev: Vite proxy or direct localhost:5000; in production: relative /api or configured origin
    const envUrl = import.meta.env.VITE_API_URL;
    this.baseUrl = envUrl || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  public clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      // Dispatch custom event for auth listeners
      window.dispatchEvent(new CustomEvent('dayscribe_auth_expired'));
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data as T;
  }

  // Auth Endpoints
  public async register(email: string, password: string, name?: string): Promise<{ token: string; user: AuthUser }> {
    const res = await this.request<{ token: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const res = await this.request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async getProfile(): Promise<{ user: AuthUser }> {
    return this.request<{ user: AuthUser }>('/auth/me');
  }

  // Sync Endpoints
  public async bulkSync(payload: SyncPayload): Promise<SyncResult> {
    return this.request<SyncResult>('/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Settings
  public async getSettings(): Promise<{ settings: any }> {
    return this.request<{ settings: any }>('/settings');
  }

  public async updateSettings(settings: any): Promise<{ settings: any }> {
    return this.request<{ settings: any }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const apiClient = new ApiClient();
