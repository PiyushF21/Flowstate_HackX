import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, ROLE_META, ROLE_HOME_ROUTES, type UserRole } from '../context/AuthContext'
import { ArrowRight, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react'
import { cn } from '../lib/utils'

const roles: UserRole[] = ['citizen', 'field_worker', 'bmc_supervisor', 'state_official', 'nexus_admin']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -15, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15, mass: 1 },
  },
}

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleRoleSelect = (role: UserRole) => {
    const meta = ROLE_META[role]
    login(role, meta.demoUser, meta.demoUserId)
    navigate(ROLE_HOME_ROUTES[role])
  }

  return (
    <div 
      className="min-h-screen bg-[#0A0B10] text-text-primary overflow-hidden flex relative selection:bg-primary/30"
      onMouseMove={(e: any) => {
        const x = (e.clientX / window.innerWidth) * 100
        const y = (e.clientY / window.innerHeight) * 100
        e.currentTarget.style.setProperty('--cursor-x', `${x}%`)
        e.currentTarget.style.setProperty('--cursor-y', `${y}%`)
      }}
    >
      
      {/* --- Immersive Background Effects --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {/* Interactive Grid with Cursor Reveal */}
         <div 
           className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:4rem_4rem]" 
           style={{
             WebkitMaskImage: 'radial-gradient(circle 800px at var(--cursor-x, 50%) var(--cursor-y, 0%), #000 10%, transparent 100%)',
             maskImage: 'radial-gradient(circle 800px at var(--cursor-x, 50%) var(--cursor-y, 0%), #000 10%, transparent 100%)'
           }}
         />
         
         {/* Top Left Orb */}
         <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
           className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/30 blur-[150px] rounded-full mix-blend-screen"
         />
         
         {/* Bottom Right Orb */}
         <motion.div 
           animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.15, 0.1] }}
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
           className="absolute -bottom-60 -right-40 w-[800px] h-[800px] bg-emerald-600/20 blur-[150px] rounded-full mix-blend-screen"
         />
      </div>

      {/* --- Main Content Layout --- */}
      <div className="relative z-10 container mx-auto max-w-7xl px-6 py-12 lg:py-0 flex flex-col lg:flex-row items-center justify-center min-h-screen gap-16 lg:gap-24">
        
        {/* Left Column: Hero Text */}
        <div className="flex-1 max-w-2xl text-center lg:text-left mt-10 lg:mt-0">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
            }}
          >
            {/* Status Badge */}
            <motion.div variants={textVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 backdrop-blur-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nexus-glow opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-nexus-glow"></span>
              </span>
              <span className="text-sm font-medium text-text-secondary tracking-wide uppercase">NEXUS Core Online</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1 variants={textVariants} className="text-5xl lg:text-7xl font-bold font-display tracking-tight mb-6 leading-[1.1]">
              Civic Infrastructure <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Reimagined.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={textVariants} className="text-lg lg:text-xl text-text-secondary mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Enter the AI-powered nervous system for city maintenance. Select your authorization portal to access real-time telemetry, automated dispatch, and agentic workflows.
            </motion.p>

            {/* Features Row */}
            <motion.div variants={textVariants} className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-text-muted font-medium">
              <div className="flex items-center gap-2"><Activity size={18} className="text-emerald-400/70" /> Real-time Sensors</div>
              <div className="flex items-center gap-2"><Zap size={18} className="text-blue-400/70" /> Auto Dispatch</div>
              <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-purple-400/70" /> RBAC Secured</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column: Portal Selection Grid */}
        <div className="flex-1 w-full max-w-2xl relative perspective-[1000px]">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {roles.map((role, idx) => {
              const meta = ROLE_META[role]
              const isNexus = role === 'nexus_admin'
              
              return (
                <motion.button
                  key={role}
                  variants={cardVariants as any}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -5,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect(role)}
                  onMouseMove={(e: any) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    const y = e.clientY - rect.top
                    e.currentTarget.style.setProperty("--mouse-x", `${x}px`)
                    e.currentTarget.style.setProperty("--mouse-y", `${y}px`)
                  }}
                  className={cn(
                    "relative group text-left p-6 rounded-3xl transition-all duration-300 isolate overflow-hidden outline-none ring-0",
                    isNexus ? "sm:col-span-2" : ""
                  )}
                >
                  {/* Card Background Base */}
                  <div className="absolute inset-0 bg-[#14151C] transition-colors duration-300 group-hover:bg-[#1A1C24]" />
                  
                  {/* Subtle Top Border Highlight */}
                  <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/[0.04] group-hover:ring-white/[0.1] transition-all duration-300" />
                  
                  {/* Hover Colored Glow */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                    style={{ background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${meta.color}15, transparent 40%)` }}
                  />

                  {/* Corner Accent */}
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 opacity-20 transform translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:opacity-40 transition-opacity duration-500" 
                    style={{ backgroundColor: meta.color }}
                  />

                  {/* Card Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header: Icon + Title */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner"
                          style={{ backgroundColor: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
                        >
                          {meta.icon}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold font-display text-text-primary tracking-wide">
                            {meta.label}
                          </h2>
                          <div className="flex items-center gap-1.5 mt-0.5 opacity-80">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                            <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase">
                              {meta.demoUser}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover Arrow */}
                      <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                        <ArrowRight size={14} className="text-text-primary" />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-grow">
                      {meta.description}
                    </p>
                    
                    {/* Nexus Special Badge */}
                    {isNexus && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-nexus-glow/10 border border-nexus-glow/20 rounded-md text-xs font-medium text-purple-300 w-fit">
                        <Sparkles size={12} /> Full System Access
                      </div>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        </div>
        
      </div>
    </div>
  )
}
