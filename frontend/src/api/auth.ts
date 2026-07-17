import api from './axios';
import type { AuthUser, LoginPayload } from '../types';

export const login = async (payload: LoginPayload) => {
  const { data } = await api.post('/auth/login', payload);
  return data as { success: boolean; token: string; user: AuthUser };
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data.user as AuthUser;
};
