import { type ReactNode } from 'react'
import NexusTopBar from './NexusTopBar'
import LiveTicker from './LiveTicker'

interface NexusLayoutProps {
  children: ReactNode
}

export default function NexusLayout({ children }: NexusLayoutProps) {
  return (
    <div className="min-h-screen bg-[#08080D] text-white overflow-hidden flex flex-col relative font-sans">
      {/* Background radial gradient to give space depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.08)_0%,_rgba(8,8,13,1)_70%)] pointer-events-none" />
      
      <NexusTopBar />
      
      <main className="flex-1 relative z-10 w-full overflow-hidden">
        {children}
      </main>

      <LiveTicker />
    </div>
  )
}
