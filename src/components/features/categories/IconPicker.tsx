'use client'

import { useState } from 'react'
import {
  ShoppingCart,
  Home,
  Car,
  Zap,
  Utensils,
  Gamepad2,
  GraduationCap,
  Shield,
  CreditCard,
  Heart,
  Briefcase,
  Plane,
  Smartphone,
  Gift,
  Coffee,
  Shirt,
  Dumbbell,
  Pill,
  BookOpen,
  Music,
  Film,
  Bus,
  Bike,
  Wifi,
  Dog,
  Baby,
  Wallet,
  Landmark,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  DollarSign,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const ICON_MAP: Record<string, LucideIcon> = {
  'shopping-cart': ShoppingCart,
  home: Home,
  car: Car,
  zap: Zap,
  utensils: Utensils,
  'gamepad-2': Gamepad2,
  'graduation-cap': GraduationCap,
  shield: Shield,
  'credit-card': CreditCard,
  heart: Heart,
  briefcase: Briefcase,
  plane: Plane,
  smartphone: Smartphone,
  gift: Gift,
  coffee: Coffee,
  shirt: Shirt,
  dumbbell: Dumbbell,
  pill: Pill,
  'book-open': BookOpen,
  music: Music,
  film: Film,
  bus: Bus,
  bike: Bike,
  wifi: Wifi,
  dog: Dog,
  baby: Baby,
  wallet: Wallet,
  landmark: Landmark,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'piggy-bank': PiggyBank,
  'dollar-sign': DollarSign,
}

export const AVAILABLE_ICONS = Object.keys(ICON_MAP)

interface IconPickerProps {
  selected: string
  onSelect: (icon: string) => void
}

export function IconPicker({ selected, onSelect }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const SelectedIcon = ICON_MAP[selected] || ShoppingCart

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 w-full px-4 py-3 rounded-lg border transition-colors min-h-[44px]',
          'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
          'hover:border-gray-300 dark:hover:border-gray-600'
        )}
      >
        <SelectedIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {selected.replace(/-/g, ' ')}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-h-60 overflow-y-auto">
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((iconName) => {
                const Icon = ICON_MAP[iconName]
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onSelect(iconName)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'flex items-center justify-center p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px]',
                      selected === iconName
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                    )}
                    title={iconName.replace(/-/g, ' ')}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
