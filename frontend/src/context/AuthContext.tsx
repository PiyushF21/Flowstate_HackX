import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type UserRole = 'citizen' | 'bmc_supervisor' | 'field_worker' | 'state_official' | 'nexus_admin'

interface AuthUser {
  role: UserRole
  userName: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (role: UserRole, userName: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

/** Role → default home route mapping */
export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  citizen: '/citizen/area-map',
  bmc_supervisor: '/bmc/dashboard',
  field_worker: '/worker/dashboard',
  state_official: '/state/overview',
  nexus_admin: '/nexus/constellation',
}

/** Role display metadata */
export const ROLE_META: Record<UserRole, { label: string; description: string; icon: string; demoUser: string; color: string }> = {
  citizen: {
    label: 'Citizen',
    description: 'Report issues, track complaints, view area map',
    icon: '👤',
    demoUser: 'Aarav Mehta',
    color: '#3B82F6',
  },
  bmc_supervisor: {
    label: 'BMC Supervisor',
    description: 'Manage issues, monitor workers, view analytics',
    icon: '🏢',
    demoUser: 'Rajesh Kadam',
    color: '#F97316',
  },
  field_worker: {
    label: 'Field Worker',
    description: 'View tasks, follow procedures, AI assistant',
    icon: '👷',
    demoUser: 'Ganesh Patil',
    color: '#10B981',
  },
  state_official: {
    label: 'State Official',
    description: 'Oversee all MCs, fund allocation, accountability',
    icon: '🏛️',
    demoUser: 'Sunita Verma',
    color: '#8B5CF6',
  },
  nexus_admin: {
    label: 'NEXUS Admin',
    description: 'Agent constellation, event stream, pipeline view',
    icon: '🧠',
    demoUser: 'System Admin',
    color: '#A855F7',
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = sessionStorage.getItem('infralens_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback((role: UserRole, userName: string) => {
    const newUser: AuthUser = { role, userName }
    setUser(newUser)
    sessionStorage.setItem('infralens_user', JSON.stringify(newUser))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem('infralens_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
