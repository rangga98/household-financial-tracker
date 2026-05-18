'use client';

import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface CreepWarningProps {
  hasLifestyleCreep: boolean;
  warningLevel: 'none' | 'warning' | 'critical';
  incomeGrowth: number | null;
  expenseGrowth: number | null;
  creepDelta: number | null;
}

export function CreepWarning({
  hasLifestyleCreep,
  warningLevel,
  incomeGrowth,
  expenseGrowth,
  creepDelta
}: CreepWarningProps) {
  // No warning needed
  if (!hasLifestyleCreep) {
    const bothGrowing = (incomeGrowth !== null && incomeGrowth > 0) &&
                       (expenseGrowth !== null && expenseGrowth > 0);

    if (bothGrowing && creepDelta !== null && creepDelta === 0) {
      return (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Balanced Growth</p>
            <p className="text-sm text-blue-700 mt-1">
              Your income and expenses are growing at the same rate.
              Your spending is keeping pace with your earnings.
            </p>
          </div>
        </div>
      );
    }

    const incomeGrowingFaster = (incomeGrowth !== null && expenseGrowth !== null &&
                                 incomeGrowth > expenseGrowth);

    if (incomeGrowingFaster) {
      return (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-emerald-200 bg-emerald-50">
          <TrendingUp className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-emerald-800">Great Progress!</p>
            <p className="text-sm text-emerald-700 mt-1">
              Your income is growing faster than your expenses.
              You&apos;re building better financial habits!
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-3 p-4 rounded-lg border border-emerald-200 bg-emerald-50">
        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-emerald-800">Spending Under Control</p>
          <p className="text-sm text-emerald-700 mt-1">
            Your spending is not outpacing your income. Keep up the good work!
          </p>
        </div>
      </div>
    );
  }

  // Warning: Lifestyle creep detected
  if (warningLevel === 'critical') {
    return (
      <div className="flex items-start gap-3 p-4 rounded-lg border border-red-500 bg-red-50">
        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-800 text-lg">Critical Lifestyle Creep Detected!</p>
          <p className="text-red-700 mt-1">
            Your expenses are growing significantly faster than your income.
          </p>
          {creepDelta !== null && (
            <p className="text-red-600 mt-1">
              Expense growth exceeds income growth by {creepDelta.toFixed(1)} percentage points.
            </p>
          )}
          <p className="text-sm text-red-600 mt-2">
            Consider reviewing your spending habits to avoid financial strain.
          </p>
        </div>
      </div>
    );
  }

  // Warning level
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-300 bg-amber-50">
      <TrendingUp className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-amber-800">Lifestyle Creep Warning</p>
        <p className="text-amber-700 mt-1">
          Your expenses are growing faster than your income.
        </p>
        {creepDelta !== null && (
          <p className="text-amber-600 text-sm mt-1">
            Gap: {creepDelta.toFixed(1)} percentage points
          </p>
        )}
      </div>
    </div>
  );
}
