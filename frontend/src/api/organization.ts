import api from './axios';
import type { OrgNode, Employee, ApiResponse } from '../types';

export const getOrgTree = async () => {
  const { data } = await api.get<ApiResponse<OrgNode[]>>('/organization/tree');
  return data.data as OrgNode[];
};

export const getReportees = async (employeeId: string) => {
  const { data } = await api.get<ApiResponse<Employee[]>>(`/employees/${employeeId}/reportees`);
  return data.data as Employee[];
};

export const assignManager = async (employeeId: string, managerId: string | null) => {
  const { data } = await api.patch<ApiResponse<Employee>>(`/employees/${employeeId}/manager`, {
    managerId,
  });
  return data.data as Employee;
};
