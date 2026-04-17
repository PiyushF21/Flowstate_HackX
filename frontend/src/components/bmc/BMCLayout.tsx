import { type ReactNode } from 'react'
import BMCSidebar from './BMCSidebar'

interface BMCLayoutProps {
  children: ReactNode
}

export default function BMCLayout({ children }: BMCLayoutProps) {
  return (
    <div className="min-h-screen flex bg-bg">
      <BMCSidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
