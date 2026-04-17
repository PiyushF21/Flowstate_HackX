import { useState, useEffect } from 'react'
import { LogOut, Bell, Car, Globe, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CitizenLayout from '../../components/citizen/CitizenLayout'
import StatusPill from '../../components/shared/StatusPill'
import CategoryIcon from '../../components/shared/CategoryIcon'
import { useAuth } from '../../context/AuthContext'
import { useApi } from '../../hooks/useApi'
import { cn, formatSmartDate } from '../../lib/utils'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { fetchApi } = useApi()
  const navigate = useNavigate()
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'resolved'>('all')
  const [complaints, setComplaints] = useState<any[]>([])

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user) return
      try {
        const issues = await fetchApi<any[]>(`/api/issues?reporter_id=${user.id}`)
        setComplaints(issues)
      } catch (err) {
        console.error("Failed to fetch complaints", err)
      }
    }
    fetchComplaints()
  }, [user, fetchApi])

  const filtered = complaints.filter((c) => {
    if (filterTab === 'active') return c.status !== 'resolved'
    if (filterTab === 'resolved') return c.status === 'resolved'
    return true
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <CitizenLayout>
      <div className="px-4 py-3">
        {/* Profile header */}
        <div className="text-center mb-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-nexus-glow/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">👤</span>
          </div>
          <h1 className="text-lg font-bold font-display text-text-primary">{user?.userName || 'Aarav Mehta'}</h1>
          <p className="text-xs text-text-muted">K-West, Mumbai • Member since April 2026</p>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-5">
          {[
            { label: 'Reported', value: '12' },
            { label: 'Resolved', value: '9' },
            { label: 'Cars', value: '2' },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 text-center rounded-xl bg-surface-elevated border border-border p-3">
              <p className="text-xl font-bold text-text-primary font-display">{stat.value}</p>
              <p className="text-[10px] text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Complaints */}
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">My Complaints</h2>
          <div className="flex gap-1 bg-surface-elevated rounded-xl p-1 border border-border mb-3">
            {(['all', 'active', 'resolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                  filterTab === tab ? 'bg-primary text-white' : 'text-text-secondary'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map((c) => (
              <div key={c.issue_id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated border border-border">
                <CategoryIcon category={c.category} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{c.description || `${c.category} issue reported`}</p>
                  <p className="text-[10px] text-text-muted">{formatSmartDate(c.created_at)}</p>
                </div>
                <StatusPill status={c.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Settings</h2>
          <div className="space-y-1">
            {[
              { icon: Bell, label: 'Notifications', value: 'On' },
              { icon: Car, label: 'My Cars', value: '2 registered' },
              { icon: Globe, label: 'Language', value: 'English' },
              { icon: Mail, label: 'Contact', value: 'aarav@email.com' },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-elevated transition-colors cursor-pointer">
                <setting.icon size={18} className="text-text-muted" />
                <span className="text-sm text-text-primary flex-1">{setting.label}</span>
                <span className="text-xs text-text-muted">{setting.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-critical/20 text-critical text-sm font-medium hover:bg-critical/5 transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </CitizenLayout>
  )
}
