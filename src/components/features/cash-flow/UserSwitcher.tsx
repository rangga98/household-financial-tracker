'use client'

import { User, Users } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Profile } from '@/types'

interface UserSwitcherProps {
  users: Profile[]
  currentUserId: string
  onSwitch: (userId: string) => void
}

export function UserSwitcher({ users, currentUserId, onSwitch }: UserSwitcherProps) {
  const activeUsers = users.filter((u) => u.isActive)

  if (activeUsers.length === 0) {
    return null
  }

  if (activeUsers.length === 1) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <User className="w-4 h-4" />
        <span>{activeUsers[0].name}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {activeUsers.map((user) => (
        <button
          key={user.id}
          onClick={() => onSwitch(user.id)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            currentUserId === user.id
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          )}
        >
          <Users className="w-4 h-4" />
          {user.name}
        </button>
      ))}
    </div>
  )
}
