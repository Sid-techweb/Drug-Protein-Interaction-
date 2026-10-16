import { apiClient } from './client';
import { AuthTokens, User } from '../types';

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  organization: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/auth/register', payload);
    return response.data;
  },

  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/auth/login', payload);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  }
};
