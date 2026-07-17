import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { OrgNode } from '../types'
import Avatar from './Avatar'

interface OrgTreeNodeProps {
  node: OrgNode
  level?: number
}

const roleColors: Record<string, string> = {
  super_admin: 'border-yellow-400 dark:border-yellow-500',
  hr_manager: 'border-blue-400 dark:border-blue-500',
  employee: 'border-gray-300 dark:border-gray-600',
}

const OrgTreeNode: React.FC<OrgTreeNodeProps> = ({ node, level = 0 }) => {
  const [expanded, setExpanded] = useState(true)
  const navigate = useNavigate()
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* Node card */}
      <div className="relative flex flex-col items-center">
        <div
          className={`
            card px-4 py-3 cursor-pointer hover:shadow-md transition-shadow
            border-t-4 ${roleColors[node.role] || roleColors.employee}
            min-w-[160px] max-w-[200px] text-center
          `}
          onClick={() => navigate(`/employees/${node._id}`)}
          title="Click to view profile"
        >
          <div className="flex justify-center mb-2">
            <Avatar name={node.name} imageUrl={node.profileImage} size="md" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{node.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{node.designation}</p>
          <span className={`text-xs mt-1 ${node.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
            {node.status}
          </span>
        </div>

        {/* Expand/collapse toggle */}
        {hasChildren && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            aria-expanded={expanded}
          >
            {expanded ? `▲ Hide (${node.children.length})` : `▼ Show (${node.children.length})`}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="relative mt-4">
          {/* Vertical connector line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-300 dark:bg-gray-600" />

          <div className="relative flex gap-6 pt-4">
            {/* Horizontal line spanning children */}
            {node.children.length > 1 && (
              <div
                className="absolute top-0 h-0.5 bg-gray-300 dark:bg-gray-600"
                style={{
                  left: `calc(50% / ${node.children.length})`,
                  right: `calc(50% / ${node.children.length})`,
                }}
              />
            )}

            {node.children.map((child) => (
              <div key={child._id} className="relative flex flex-col items-center">
                {/* Connector to this child */}
                <div className="w-0.5 h-4 bg-gray-300 dark:bg-gray-600" />
                <OrgTreeNode node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface OrgTreeProps {
  roots: OrgNode[]
}

const OrgTree: React.FC<OrgTreeProps> = ({ roots }) => {
  if (roots.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">🌳</p>
        <p>No organizational data found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex flex-col items-center gap-8 min-w-max px-8 pt-4">
        {roots.map((root) => (
          <OrgTreeNode key={root._id} node={root} />
        ))}
      </div>
    </div>
  )
}

export default OrgTree
