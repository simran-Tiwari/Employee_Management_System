import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStats } from '../context/StatsContext'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

interface StatCardProps {
  title: string
  value: number
  icon: string
  color: string
  onClick?: () => void
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => (
  <div
    className={`card p-6 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
    </div>
  </div>
)

const DashboardPage = () => {
  const { stats, statsLoading, refreshStats } = useStats()
  const navigate = useNavigate()

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  if (statsLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-16 text-red-500">
        <p className="text-4xl mb-3">⚠️</p>
        <p>Failed to load dashboard stats.</p>
        <button onClick={refreshStats} className="btn-secondary mt-4">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Overview of your organization
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshStats}
            disabled={statsLoading}
            className="btn-secondary flex items-center gap-2"
            title="Refresh stats"
          >
            {statsLoading ? <LoadingSpinner size="sm" /> : '🔄'} Refresh
          </button>
          <button onClick={() => navigate('/employees/new')} className="btn-primary">
            + Add Employee
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={stats.total}
          icon="👥"
          color="bg-indigo-100 dark:bg-indigo-900/40"
          onClick={() => navigate('/employees')}
        />
        <StatCard
          title="Active Employees"
          value={stats.active}
          icon="✅"
          color="bg-green-100 dark:bg-green-900/40"
          onClick={() => navigate('/employees?status=active')}
        />
        <StatCard
          title="Inactive Employees"
          value={stats.inactive}
          icon="⏸️"
          color="bg-red-100 dark:bg-red-900/40"
          onClick={() => navigate('/employees?status=inactive')}
        />

        {/* Departments card — lists all department names */}
        <div
          className="card p-5 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/employees')}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-full flex items-center justify-center text-2xl bg-purple-100 dark:bg-purple-900/40 shrink-0">
              🏗️
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Departments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.departments.length}
              </p>
            </div>
          </div>
          {stats.departments.length > 0 ? (
            <ul className="space-y-1">
              {stats.departments.map((dept) => (
                <li
                  key={dept}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/employees?department=${encodeURIComponent(dept)}`)
                  }}
                  className="text-xs px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 cursor-pointer transition-colors truncate"
                  title={dept}
                >
                  {dept}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">No departments yet</p>
          )}
        </div>
      </div>

      {/* Department breakdown chart */}
      {stats.departmentBreakdown.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Employees by Department
          </h2>
          <p className="text-xs text-gray-400 mb-4">Click a bar to filter employees by department</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.departmentBreakdown}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [`${value} employees`, 'Count']}
                  cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  style={{ cursor: 'pointer' }}
                  onClick={(data) => {
                    if (data?._id) {
                      navigate(`/employees?department=${encodeURIComponent(data._id)}`)
                    }
                  }}
                >
                  {stats.departmentBreakdown.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/employees/new')} className="btn-primary">
            ➕ Add Employee
          </button>
          <button onClick={() => navigate('/employees')} className="btn-secondary">
            👥 View All Employees
          </button>
          <button onClick={() => navigate('/organization')} className="btn-secondary">
            🌳 View Org Chart
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
