import { useAuth } from '../../context/AuthContext'
import { ROLE_META, type UserRole } from '../../context/AuthContext'

interface PlaceholderPageProps {
  title: string
  role: UserRole
  icon?: string
}

/**
 * Temporary placeholder component used during scaffolding.
 * Will be replaced with real page components in later phases.
 */
export default function PlaceholderPage({ title, role, icon }: PlaceholderPageProps) {
  const { user, logout } = useAuth()
  const meta = ROLE_META[role]

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="glass-card text-center max-w-md w-full">
        <span className="text-4xl mb-4 block">{icon || meta.icon}</span>
        <h1 className="text-2xl font-bold font-display text-text-primary mb-2">
          {title}
        </h1>
        <p className="text-text-secondary text-sm mb-1">
          {meta.label} Dashboard
        </p>
        <p className="text-text-muted text-xs mb-6">
          Logged in as: {user?.userName}
        </p>
        <div
          className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-6"
          style={{
            color: meta.color,
            backgroundColor: `${meta.color}15`,
            border: `1px solid ${meta.color}30`,
          }}
        >
          🚧 Under Construction — Phase 4+
        </div>
        <br />
        <button
          onClick={logout}
          className="mt-2 px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  )
}
