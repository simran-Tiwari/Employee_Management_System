import React, { createContext, useContext, useState, useCallback } from 'react'
import { getDashboardStats } from '../api/employees'
import type { DashboardStats } from '../types'

interface StatsContextValue {
  stats: DashboardStats | null
  statsLoading: boolean
  refreshStats: () => Promise<void>
}

const StatsContext = createContext<StatsContextValue | undefined>(undefined)

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const refreshStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch {
      // silently fail — dashboard page handles its own error display
    } finally {
      setStatsLoading(false)
    }
  }, [])

  return (
    <StatsContext.Provider value={{ stats, statsLoading, refreshStats }}>
      {children}
    </StatsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStats = (): StatsContextValue => {
  const ctx = useContext(StatsContext)
  if (!ctx) throw new Error('useStats must be used inside StatsProvider')
  return ctx
}
