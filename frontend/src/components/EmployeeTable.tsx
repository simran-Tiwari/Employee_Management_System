import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Employee, EmployeeFilters } from '../types'
import Avatar from './Avatar'
import Modal from './Modal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { deleteEmployee } from '../api/employees'

interface EmployeeTableProps {
  employees: Employee[]
  filters: EmployeeFilters
  onSortChange: (sortBy: string) => void
  onDeleted: () => Promise<void>
}

const SortIcon = ({ field, sortBy, order }: { field: string; sortBy?: string; order?: string }) => {
  if (sortBy !== field) return <span className="text-gray-300 ml-1">↕</span>
  return <span className="text-indigo-500 ml-1">{order === 'asc' ? '↑' : '↓'}</span>
}

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  hr_manager: 'HR Manager',
  employee: 'Employee',
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, filters, onSortChange, onDeleted }) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleSortClick = (field: string) => {
    onSortChange(field)
  }

  const confirmDelete = (emp: Employee) => {
    setDeleteTarget(emp)
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeletingId(deleteTarget._id)
    try {
      await deleteEmployee(deleteTarget._id)
      showToast(`${deleteTarget.name} has been deleted.`, 'success')
      setModalOpen(false)
      await onDeleted()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete employee'
      showToast(msg, 'error')
    } finally {
      setDeletingId(null)
      setDeleteTarget(null)
    }
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-gray-500">
        <p className="text-4xl mb-3">👥</p>
        <p className="font-medium">No employees found</p>
        <p className="text-sm mt-1">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Role</th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                onClick={() => handleSortClick('joiningDate')}
              >
                Joining Date
                <SortIcon field="joiningDate" sortBy={filters.sortBy} order={filters.order} />
              </th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reporting To</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {employees.map((emp) => (
              <tr
                key={emp._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={emp.name} imageUrl={emp.profileImage} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{emp.name}</p>
                      <p className="text-xs text-gray-400">{emp.email}</p>
                      <p className="text-xs text-gray-400">{emp.employeeId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{emp.department}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{emp.designation}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    {roleLabels[emp.role] || emp.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {new Date(emp.joiningDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={emp.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">
                  {emp.reportingManager
                    ? (typeof emp.reportingManager === 'object' ? emp.reportingManager.name : '—')
                    : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/employees/${emp._id}`)}
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 text-xs font-medium"
                    >
                      View
                    </button>
                    {(user?.role === 'super_admin' || user?.role === 'hr_manager') && (
                      <button
                        onClick={() => navigate(`/employees/${emp._id}/edit`)}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-xs font-medium"
                      >
                        Edit
                      </button>
                    )}
                    {user?.role === 'super_admin' && (
                      <button
                        onClick={() => confirmDelete(emp)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Employee"
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={!!deletingId}
      >
        <p>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot
          be undone (soft delete).
        </p>
      </Modal>
    </>
  )
}

export default EmployeeTable
