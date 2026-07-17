import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEmployee } from '../api/employees'
import { getReportees } from '../api/organization'
import type { Employee } from '../types'
import Avatar from '../components/Avatar'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  hr_manager: 'HR Manager',
  employee: 'Employee',
}

const Detail: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-medium">{value || '—'}</dd>
  </div>
)

const EmployeeViewPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [reportees, setReportees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([
      getEmployee(id).then(setEmployee),
      getReportees(id).then(setReportees),
    ])
      .catch(() => setError('Employee not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="text-center py-16 text-red-500">
        <p className="text-4xl mb-3">⚠️</p>
        <p>{error || 'Employee not found'}</p>
        <button onClick={() => navigate('/employees')} className="btn-secondary mt-4">
          Back to Employees
        </button>
      </div>
    )
  }

  const canEdit = user?.role === 'super_admin' || user?.role === 'hr_manager' || user?.id === employee._id

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-secondary px-3 py-1.5 text-sm">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Profile</h1>
        {canEdit && (
          <button
            onClick={() => navigate(`/employees/${employee._id}/edit`)}
            className="btn-primary ml-auto"
          >
            Edit
          </button>
        )}
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar name={employee.name} imageUrl={employee.profileImage} size="lg" />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{employee.designation}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                {roleLabels[employee.role]}
              </span>
              <span className={employee.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                {employee.status}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {employee.employeeId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
          Personal Information
        </h3>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <Detail label="Email" value={employee.email} />
          <Detail label="Phone" value={employee.phone} />
          <Detail label="Department" value={employee.department} />
          <Detail label="Designation" value={employee.designation} />
          <Detail label="Salary" value={employee.salary ? `₹${employee.salary.toLocaleString()}` : undefined} />
          <Detail
            label="Joining Date"
            value={employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : undefined}
          />
          <Detail
            label="Reporting Manager"
            value={
              employee.reportingManager && typeof employee.reportingManager === 'object'
                ? employee.reportingManager.name
                : undefined
            }
          />
        </dl>
      </div>

      {/* Direct Reports */}
      {reportees.length > 0 && (
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Direct Reports ({reportees.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reportees.map((r) => (
              <button
                key={r._id}
                onClick={() => navigate(`/employees/${r._id}`)}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
              >
                <Avatar name={r.name} imageUrl={r.profileImage} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.designation}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeViewPage
