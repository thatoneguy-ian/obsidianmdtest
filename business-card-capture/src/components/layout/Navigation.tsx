import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Monitor, Clock, User } from 'lucide-react'
import { cn } from '@/components/ui/utils'

const navItems = [
  { to: '/scan/camera', icon: Camera, label: 'Scan' },
  { to: '/scan/desktop', icon: Monitor, label: 'Desktop' },
  { to: '/recent', icon: Clock, label: 'Recent' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export function Navigation() {
  return (
    <nav className="border-t border-surface-800 bg-black/95 backdrop-blur-xl safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                isActive ? 'text-brand-500' : 'text-surface-500 hover:text-surface-300'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-brand-500/10 rounded-xl border border-brand-500/25"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold tracking-wide uppercase">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
