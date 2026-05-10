'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, Wallet, Shield } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/report', label: 'Report', icon: BarChart3 },
  { href: '/budgeting', label: 'Budget', icon: Wallet },
  { href: '/emergency-fund', label: 'Emergency', icon: Shield },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-around py-2 md:py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col md:flex-row md:gap-2 items-center gap-1 px-3 py-1 md:px-4 md:py-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] md:min-h-[48px]',
                isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
