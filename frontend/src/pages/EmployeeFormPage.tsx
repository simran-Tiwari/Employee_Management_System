import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getEmployee, createEmployee, updateEmployee, getEmployees } from '../api/employees'
import type { Employee } from '../types'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'Phone must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  salary: z.coerce.number().min(0, 'Salary must be positive').optional(),
  joiningDate: z.string().min(1, 'Joining date is required'),
  status: z.enum(['active', 'inactive']),
  role: z.enum(['super_admin', 'hr_manager', 'employee']),
  reportingManager: z.string().optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

const DEPARTMENTS = ['Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance', 'Operations', 'Management']

const EmployeeFormPage = () => {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()

  const [loadingData, setLoadingData] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [managers, setManagers] = useState<Employee[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', role: 'employee' },
  })

  // Load employee data and manager list in parallel
  useEffect(() => {
    const fetchManagers = getEmployees({ limit: 100, status: 'active' }).then((r) =>
      setManagers(r.employees)
    )

    if (isEdit && id) {
      Promise.all([
        getEmployee(id).then((emp) => {
          reset({
            name: emp.name,
            email: emp.email,
            phone: emp.phone || '',
            department: emp.department,
            designation: emp.designation,
            salary: emp.salary,
            joiningDate: emp.joiningDate ? emp.joiningDate.slice(0, 10) : '',
            status: emp.status,
            role: emp.role,
            reportingManager:
              emp.reportingManager && typeof emp.reportingManager === 'object'
                ? emp.reportingManager._id
                : '',
          })
        }),
        fetchManagers,
      ]).finally(() => setLoadingData(false))
    } else {
      fetchManagers.finally(() => setLoadingData(false))
    }
  }, [id, isEdit, reset])

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const payload: Partial<Employee> & { password?: string } = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        department: data.department,
        designation: data.designation,
        salary: data.salary,
        joiningDate: data.joiningDate,
        status: data.status,
        role: data.role,
        reportingManager: (data.reportingManager || undefined) as unknown as Employee,
      }

      if (!isEdit && data.password) payload.password = data.password
      if (!isEdit && !data.password) {
        showToast('Password is required when creating an employee.', 'error')
        setSubmitting(false)
        return
      }

      if (isEdit && id) {
        await updateEmployee(id, payload)
        showToast('Employee updated successfully!', 'success')
      } else {
        await createEmployee(payload as Parameters<typeof createEmployee>[0])
        showToast('Employee created successfully!', 'success')
      }
      navigate('/employees')
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'An error occurred'
      showToast(msg || 'Failed to save employee', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const fieldClass = (hasError: boolean) =>
    `input ${hasError ? 'border-red-400 focus:ring-red-400' : ''}`

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-secondary px-3 py-1.5 text-sm">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Employee' : 'Add Employee'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="label">Full Name *</label>
              <input type="text" className={fieldClass(!!errors.name)} {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email *</label>
              <input type="email" className={fieldClass(!!errors.email)} {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password (create only) */}
            {!isEdit && (
              <div>
                <label className="label">Password *</label>
                <input
                  type="password"
                  className={fieldClass(!!errors.password)}
                  placeholder="Min. 8 characters"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                className={fieldClass(!!errors.phone)}
                placeholder="10-digit number"
                {...register('phone')}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 pt-2">
            Employment Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Department */}
            <div>
              <label className="label">Department *</label>
              <select className={fieldClass(!!errors.department)} {...register('department')}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department.message}</p>}
            </div>

            {/* Designation */}
            <div>
              <label className="label">Designation *</label>
              <input type="text" className={fieldClass(!!errors.designation)} {...register('designation')} />
              {errors.designation && <p className="mt-1 text-xs text-red-500">{errors.designation.message}</p>}
            </div>

            {/* Salary */}
            <div>
              <label className="label">Salary (₹)</label>
              <input
                type="number"
                min="0"
                className={fieldClass(!!errors.salary)}
                {...register('salary')}
              />
              {errors.salary && <p className="mt-1 text-xs text-red-500">{errors.salary.message}</p>}
            </div>

            {/* Joining Date */}
            <div>
              <label className="label">Joining Date *</label>
              <input type="date" className={fieldClass(!!errors.joiningDate)} {...register('joiningDate')} />
              {errors.joiningDate && <p className="mt-1 text-xs text-red-500">{errors.joiningDate.message}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="label">Status</label>
              <select className="input" {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Role — Super Admin only */}
            {user?.role === 'super_admin' && (
              <div>
                <label className="label">Role</label>
                <select className="input" {...register('role')}>
                  <option value="employee">Employee</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            )}

            {/* Reporting Manager */}
            <div className="md:col-span-2">
              <label className="label">Reporting Manager</label>
              <select className="input" {...register('reportingManager')}>
                <option value="">No manager</option>
                {managers
                  .filter((m) => m._id !== id)
                  .map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} — {m.designation} ({m.department})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Form actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting && <LoadingSpinner size="sm" />}
              {submitting ? 'Saving…' : isEdit ? 'Update Employee' : 'Create Employee'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EmployeeFormPage
