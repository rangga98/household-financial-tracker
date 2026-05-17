import type { TaxInstallment } from '@/types/tax-planning'

interface InstallmentScheduleTableProps {
  installments: TaxInstallment[]
  monthlyInstallment: number
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export function InstallmentScheduleTable({ installments, monthlyInstallment }: InstallmentScheduleTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-2 text-left">Month</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2 text-right">Cumulative</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {installments.map((installment, index) => (
            <tr
              key={installment.month}
              className={
                index === 0
                  ? 'bg-blue-50 dark:bg-blue-950/30 font-medium'
                  : 'bg-white dark:bg-gray-900'
              }
            >
              <td className="px-4 py-2 text-gray-700 dark:text-gray-200">{installment.month}</td>
              <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-100">
                {formatIDR(installment.amount)}
              </td>
              <td className="px-4 py-2 text-right text-gray-500 dark:text-gray-400">
                {formatIDR(installment.cumulativeAmount)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <tr>
            <td colSpan={3} className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
              Monthly allocation: {formatIDR(monthlyInstallment)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
