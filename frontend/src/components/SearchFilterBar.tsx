import { useEffect, useRef, useState } from 'react'
import type { EmployeeFilters } from '../types'

const DEPARTMENTS = ['Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance', 'Operations', 'Management']
const ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'employee', label: 'Employee' },
]
const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

interface SearchFilterBarProps {
  filters: EmployeeFilters
  onChange: (filters: EmployeeFilters) => void
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ filters, onChange }) => {
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange({ ...filters, search: localSearch, page: 1 })
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [localSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (key: keyof EmployeeFilters, value: string) => {
    onChange({ ...filters, [key]: value, page: 1 })
  }

  const handleClear = () => {
    setLocalSearch('')
    onChange({ page: 1, limit: filters.limit })
  }

  const hasFilters = localSearch || filters.department || filters.role || filters.status

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="input pl-9"
          aria-label="Search employees"
        />
      </div>

      {/* Department filter */}
      <select
        value={filters.department || ''}
        onChange={(e) => handleFilter('department', e.target.value)}
        className="input w-auto"
        aria-label="Filter by department"
      >
        <option value="">All Departments</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Role filter */}
      <select
        value={filters.role || ''}
        onChange={(e) => handleFilter('role', e.target.value)}
        className="input w-auto"
        aria-label="Filter by role"
      >
        <option value="">All Roles</option>
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={filters.status || ''}
        onChange={(e) => handleFilter('status', e.target.value)}
        className="input w-auto"
        aria-label="Filter by status"
      >
        <option value="">All Status</option>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button onClick={handleClear} className="btn-secondary text-sm whitespace-nowrap">
          Clear Filters
        </button>
      )}
    </div>
  )
}

export default SearchFilterBar
