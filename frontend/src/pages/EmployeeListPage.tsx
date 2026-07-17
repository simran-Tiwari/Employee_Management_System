import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getEmployees } from '../api/employees'
import type { Employee, EmployeeFilters, PaginationMeta } from '../types'
import EmployeeTable from '../components/EmployeeTable'
import SearchFilterBar from '../components/SearchFilterBar'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { useStats } from '../context/StatsContext'

const EmployeeListPage = () => {
  const { user } = useAuth()
  const { refreshStats } = useStats()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState<EmployeeFilters>({
    search: '',
    department: searchParams.get('department') || '',
    role: '',
    status: searchParams.get('status') || '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 10,
  })

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getEmployees(filters)
      setEmployees(result.employees)
      setPagination(result.pagination)
    } catch {
      setError('Failed to load employees.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // When an employee is deleted: refresh list AND dashboard stats
  const handleDeleted = useCallback(async () => {
    await Promise.all([fetchEmployees(), refreshStats()])
  }, [fetchEmployees, refreshStats])

  const handleSortChange = (sortBy: string) => {
    setFilters((f) => ({
      ...f,
      sortBy,
      order: f.sortBy === sortBy && f.order === 'asc' ? 'desc' : 'asc',
      page: 1,
    }))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pagination.total} employee{pagination.total !== 1 ? 's' : ''} found
          </p>
          {filters.department && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
              Filtered by department: <strong>{filters.department}</strong>
              <button
                className="ml-2 underline"
                onClick={() => setFilters((f) => ({ ...f, department: '', page: 1 }))}
              >
                Clear
              </button>
            </p>
          )}
          {filters.status && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
              Filtered by status: <strong>{filters.status}</strong>
              <button
                className="ml-2 underline"
                onClick={() => setFilters((f) => ({ ...f, status: '', page: 1 }))}
              >
                Clear
              </button>
            </p>
          )}
        </div>
        {(user?.role === 'super_admin' || user?.role === 'hr_manager') && (
          <button onClick={() => navigate('/employees/new')} className="btn-primary">
            + Add Employee
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <SearchFilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>{error}</p>
            <button onClick={fetchEmployees} className="btn-secondary mt-4">
              Retry
            </button>
          </div>
        ) : (
          <>
            <EmployeeTable
              employees={employees}
              filters={filters}
              onSortChange={handleSortChange}
              onDeleted={handleDeleted}
            />
            <Pagination
              pagination={pagination}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default EmployeeListPage
