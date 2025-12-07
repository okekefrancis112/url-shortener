// utils/auth.ts
const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';

export interface AuthResponse {
  message: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // If using cookies
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  // Signup user
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // If using cookies
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  },

  // Logout user
  async logout(): Promise<void> {
    // Clear token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // If using cookies, you might want to call a logout endpoint
    // await fetch(`${API_URL}/api/auth/logout`, { method: 'POST' });
  },

  // Get current user from token
  getCurrentUser(): any {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // Decode JWT token (without verification for client-side)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

  // Store authentication token
  storeToken(token: string): void {
    localStorage.setItem('token', token);
  },

  // Get stored token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }
};