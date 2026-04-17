import { useState, useEffect } from 'react'
import { LogOut, Bell, Car, Globe, Mail, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CitizenLayout from '../../components/citizen/CitizenLayout'
import StatusPill from '../../components/shared/StatusPill'
import SeverityBadge from '../../components/shared/SeverityBadge'
import CategoryIcon from '../../components/shared/CategoryIcon'
import { useAuth } from '../../context/AuthContext'
import { useApi } from '../../hooks/useApi'
import { cn, formatSmartDate } from '../../lib/utils'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { fetchApi } = useApi()
  const navigate = useNavigate()
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'resolved'>('all')
  const [complaints, setComplaints] = useState<any[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null)

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user) return
      try {
        // If user.id is set, filter by reporter. Otherwise fetch all and show manual_complaint source.
        const endpoint = user.id && user.id !== 'undefined'
          ? `/api/issues/?reporter_id=${user.id}`
          : `/api/issues/?source=manual_complaint`
        const data = await fetchApi<any>(endpoint)
        const arr = Array.isArray(data) ? data : (data?.issues || [])
        setComplaints(arr)
      } catch (err) {
        console.error("Failed to fetch complaints", err)
      }
    }
    fetchComplaints()
    const interval = setInterval(fetchComplaints, 5000)
    return () => clearInterval(interval)
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

  const resolvedCount = complaints.filter(c => c.status === 'resolved').length

  // Issue Detail View
  if (selectedComplaint) {
    const c = selectedComplaint
    const beforeImages = c.images || []
    const afterImages = c.completion?.proof_images || []

    return (
      <CitizenLayout>
        <div className="px-4 py-3">
          <button onClick={() => setSelectedComplaint(null)} className="flex items-center gap-1 text-text-muted text-xs mb-3 hover:text-text-primary">
            <ArrowLeft size={14} /> Back to profile
          </button>

          {/* Header */}
          <div className="rounded-xl bg-surface-elevated border border-border p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CategoryIcon category={c.category} size="sm" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{c.description || `${c.category} issue reported`}</p>
                <p className="text-[10px] text-text-muted font-mono">{c.issue_id}</p>
              </div>
              <SeverityBadge severity={c.severity} size="sm" pulse={false} />
            </div>
            <div className="flex items-center gap-3 mt-2">
              <StatusPill status={c.status} />
              <span className="text-[10px] text-text-muted">{formatSmartDate(c.created_at)}</span>
            </div>
          </div>

          {/* Location */}
          {c.location && (
            <div className="rounded-xl bg-surface-elevated border border-border p-3 mb-4">
              <p className="text-sm font-medium text-text-primary mb-1">📍 Location</p>
              <p className="text-xs text-text-secondary">{c.location.address || c.location.city || 'Mumbai'}</p>
              {c.location.ward && <p className="text-[10px] text-text-muted">Ward: {c.location.ward}</p>}
            </div>
          )}

          {/* Assigned Worker */}
          {c.assigned_to && (
            <div className="rounded-xl bg-surface-elevated border border-border p-3 mb-4">
              <p className="text-sm font-medium text-text-primary mb-1">👷 Assigned To</p>
              <p className="text-xs text-text-secondary">{c.assigned_to.worker_name || c.assigned_to.worker_id}</p>
              {c.deadline && <p className="text-[10px] text-text-muted">Deadline: {formatSmartDate(c.deadline)}</p>}
            </div>
          )}

          {/* Before & After Photos */}
          {(beforeImages.length > 0 || afterImages.length > 0) && (
            <div className="rounded-xl border border-border bg-surface-elevated p-3 mb-4">
              <p className="text-sm font-medium text-text-primary mb-3">📷 Before & After</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-text-muted mb-1.5 font-semibold uppercase tracking-wider">Before</p>
                  {beforeImages.length > 0 ? (
                    <div className="space-y-2">
                      {beforeImages.map((img: string, i: number) => (
                        <img
                          key={i}
                          src={img.startsWith('http') ? img : `${API_BASE}${img}`}
                          alt={`Before ${i + 1}`}
                          className="w-full aspect-[4/3] object-cover rounded-lg border border-border"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/3] rounded-lg bg-surface-hover flex items-center justify-center text-text-muted text-xs">No photo</div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-text-muted mb-1.5 font-semibold uppercase tracking-wider">After</p>
                  {afterImages.length > 0 ? (
                    <div className="space-y-2">
                      {afterImages.map((img: string, i: number) => (
                        <img
                          key={i}
                          src={img.startsWith('http') ? img : `${API_BASE}${img}`}
                          alt={`After ${i + 1}`}
                          className="w-full aspect-[4/3] object-cover rounded-lg border border-border"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/3] rounded-lg bg-surface-hover flex items-center justify-center text-text-muted text-xs">
                      {c.status === 'resolved' ? 'No proof photo' : 'Pending resolution'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-xl bg-surface-elevated border border-border p-3">
            <p className="text-sm font-medium text-text-primary mb-3">📋 Timeline</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-text-secondary">Reported — {formatSmartDate(c.created_at)}</span>
              </div>
              {c.assigned_to && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-agent-commander" />
                  <span className="text-text-secondary">Assigned to {c.assigned_to.worker_name}</span>
                </div>
              )}
              {c.status === 'in_progress' && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-high animate-pulse" />
                  <span className="text-text-secondary">Work in progress</span>
                </div>
              )}
              {c.status === 'resolved' && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-text-secondary">Resolved ✅</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CitizenLayout>
    )
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
            { label: 'Reported', value: String(complaints.length) },
            { label: 'Resolved', value: String(resolvedCount) },
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
              <button
                key={c.issue_id}
                onClick={() => setSelectedComplaint(c)}
                className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-surface-elevated border border-border hover:border-primary/30 transition-colors"
              >
                <CategoryIcon category={c.category} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{c.description || `${c.category} issue reported`}</p>
                  <p className="text-[10px] text-text-muted">{formatSmartDate(c.created_at)}</p>
                </div>
                <StatusPill status={c.status} />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-text-muted text-center py-6">No complaints found.</p>
            )}
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
