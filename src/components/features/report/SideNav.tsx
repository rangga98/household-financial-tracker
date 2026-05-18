'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, Wallet, Shield, ShieldCheck, Tag, Target, PiggyBank, TrendingUp, FileText, ChevronLeft, ChevronRight, Menu, X, Activity, Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/report', label: 'Report', icon: BarChart3 },
  { href: '/budgeting', label: 'Budget', icon: Wallet },
  { href: '/emergency-fund', label: 'Emergency', icon: Shield },
  { href: '/financial-freedom', label: 'FI', icon: Target },
  { href: '/sinking-funds', label: 'Savings', icon: PiggyBank },
  { href: '/net-worth', label: 'Net Worth', icon: TrendingUp },
  { href: '/risk-management', label: 'Protection', icon: ShieldCheck },
  { href: '/tax-planning', label: 'Tax', icon: FileText },
  { href: '/giving', label: 'Giving', icon: Heart },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/analytics/lifestyle-creep', label: 'Lifestyle Creep', icon: Activity },
]

export function SideNav() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile overlay + menu panel */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* Mobile menu panel (slides from bottom-right near FAB) */}
      <div
        className={cn(
          'fixed bottom-20 right-4 z-50 md:hidden w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 origin-bottom-right',
          mobileOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        <div className="p-2 space-y-0.5 max-h-[70vh] overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 transition-colors',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Mobile FAB (bottom-right) */}
      <button
        className="fixed bottom-4 right-4 z-50 md:hidden flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Sidebar */}
      <nav
        className={cn(
          'fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 hidden md:flex flex-col transition-all duration-200 ease-in-out',
          expanded ? 'w-52' : 'w-16'
        )}
      >
        {/* Logo / brand area */}
        <div className={cn(
          'flex items-center h-16 px-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0',
          expanded ? 'justify-between' : 'justify-center'
        )}>
          {expanded && (
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
              Finance Tracker
            </span>
          )}
          {/* Desktop collapse toggle */}
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors min-h-[44px]',
                  expanded ? 'justify-start' : 'justify-center',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                title={!expanded ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className={cn(
                  'text-sm font-medium truncate transition-all duration-150',
                  expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
