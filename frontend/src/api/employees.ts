import api from './axios';
import type { Employee, EmployeeFilters, EmployeeListResponse, DashboardStats, ApiResponse } from '../types';

export const getEmployees = async (filters: EmployeeFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const { data } = await api.get<EmployeeListResponse>(`/employees?${params.toString()}`);
  return data;
};

export const getEmployee = async (id: string) => {
  const { data } = await api.get<ApiResponse<Employee>>(`/employees/${id}`);
  return data.data as Employee;
};

export const createEmployee = async (payload: Partial<Employee> & { password: string }) => {
  const { data } = await api.post<ApiResponse<Employee>>('/employees', payload);
  return data.data as Employee;
};

export const updateEmployee = async (id: string, payload: Partial<Employee>) => {
  const { data } = await api.put<ApiResponse<Employee>>(`/employees/${id}`, payload);
  return data.data as Employee;
};

export const patchEmployee = async (id: string, payload: Partial<Employee>) => {
  const { data } = await api.patch<ApiResponse<Employee>>(`/employees/${id}`, payload);
  return data.data as Employee;
};

export const deleteEmployee = async (id: string) => {
  const { data } = await api.delete<ApiResponse>(`/employees/${id}`);
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get<ApiResponse<DashboardStats>>('/employees/stats');
  return data.data as DashboardStats;
};
