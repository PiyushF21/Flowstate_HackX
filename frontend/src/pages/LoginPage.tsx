import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, ROLE_META, ROLE_HOME_ROUTES, type UserRole } from '../context/AuthContext'

const roles: UserRole[] = ['citizen', 'bmc_supervisor', 'field_worker', 'state_official', 'nexus_admin']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleRoleSelect = (role: UserRole) => {
    const meta = ROLE_META[role]
    login(role, meta.demoUser)
    navigate(ROLE_HOME_ROUTES[role])
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-nexus-glow/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative z-10"
      >
        <h1 className="text-5xl font-bold font-display text-text-primary mb-3 tracking-tight">
          🔍 InfraLens
        </h1>
        <p className="text-text-secondary text-lg max-w-md mx-auto">
          AI-Powered Civic Infrastructure Intelligence Platform
        </p>
        <div className="mt-4 h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-primary via-nexus-glow to-primary" />
      </motion.div>

      {/* Role Selection Label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-text-muted text-sm mb-6 tracking-wide uppercase"
      >
        Select your role to continue
      </motion.p>

      {/* Role Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl w-full relative z-10"
      >
        {roles.map((role) => {
          const meta = ROLE_META[role]
          return (
            <motion.button
              key={role}
              variants={cardVariants as any}
              whileHover={{
                scale: 1.04,
                boxShadow: `0 0 40px ${meta.color}22, 0 20px 60px rgba(0,0,0,0.4)`,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect(role)}
              className="glass-card-interactive text-left group relative overflow-hidden"
              style={{
                borderColor: `${meta.color}20`,
              }}
              id={`login-role-${role}`}
            >
              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{
                  background: `radial-gradient(ellipse at center, ${meta.color}08 0%, transparent 70%)`,
                }}
              />

              {/* Top color accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)` }}
              />

              <div className="relative z-10">
                {/* Icon + Label */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{meta.icon}</span>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary font-display">
                      {meta.label}
                    </h2>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        color: meta.color,
                        backgroundColor: `${meta.color}15`,
                        border: `1px solid ${meta.color}30`,
                      }}
                    >
                      {meta.demoUser}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-text-secondary text-sm leading-relaxed">
                  {meta.description}
                </p>

                {/* Arrow */}
                <div className="mt-4 flex items-center gap-1 text-text-muted group-hover:text-text-secondary transition-colors text-xs">
                  <span>Continue as {meta.demoUser}</span>
                  <svg
                    className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-text-muted text-xs mt-12"
      >
        InfraLens v1.0 — Hackathon Demo
      </motion.p>
    </div>
  )
}
