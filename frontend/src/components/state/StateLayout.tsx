import { type ReactNode } from 'react'
import StateSidebar from './StateSidebar'

interface StateLayoutProps {
  children: ReactNode
}

export default function StateLayout({ children }: StateLayoutProps) {
  return (
    <div className="min-h-screen flex bg-bg">
      <StateSidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
