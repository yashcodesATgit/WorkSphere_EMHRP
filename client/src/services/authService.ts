import api from '../lib/axios';
import { AuthUser } from '../store/authStore';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

// Phase 5 will implement the real API call.
// This function is the single place to update when the backend endpoint exists.
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  // Phase 5: call POST /api/auth/logout to invalidate the server session/token.
  // For now, logout is handled client-side only in the auth store.
};
