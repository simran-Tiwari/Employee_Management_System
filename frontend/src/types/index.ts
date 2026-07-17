// ============================================================
// Shared TypeScript interfaces and types
// ============================================================

export type Role = 'super_admin' | 'hr_manager' | 'employee';
export type Status = 'active' | 'inactive';

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  salary?: number;
  joiningDate: string;
  status: Status;
  role: Role;
  reportingManager?: Employee | null;
  profileImage?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  designation: string;
  profileImage?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: AuthUser;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface EmployeeListResponse {
  success: boolean;
  employees: Employee[];
  pagination: PaginationMeta;
}

export interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  departments: string[];
  departmentCount: number;
  departmentBreakdown: { _id: string; count: number }[];
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OrgNode extends Omit<Employee, 'reportingManager'> {
  children: OrgNode[];
}
