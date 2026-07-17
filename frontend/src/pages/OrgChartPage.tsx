import { useEffect, useState } from 'react'
import { getOrgTree } from '../api/organization'
import type { OrgNode } from '../types'
import OrgTree from '../components/OrgTree'
import LoadingSpinner from '../components/LoadingSpinner'

const OrgChartPage = () => {
  const [roots, setRoots] = useState<OrgNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getOrgTree()
      .then(setRoots)
      .catch(() => setError('Failed to load org chart.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Chart</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Click any employee card to view their profile.
        </p>
      </div>

      {/* Legend */}
      <div className="card p-3 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" /> Super Admin
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> HR Manager
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-gray-400 inline-block" /> Employee
        </span>
      </div>

      <div className="card p-4">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <OrgTree roots={roots} />
        )}
      </div>
    </div>
  )
}

export default OrgChartPage
