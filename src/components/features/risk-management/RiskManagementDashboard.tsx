'use client'

import { useState, useTransition } from 'react'
import { InsuranceSummaryCard } from './InsuranceSummaryCard'
import { PolicyList } from './PolicyList'
import { PolicyForm } from './PolicyForm'
import { ProtectionTargetForm } from './ProtectionTargetForm'
import { MarkPaidForm } from './MarkPaidForm'
import { HealthBudgetTab } from './HealthBudgetTab'
import { deactivateInsurancePolicy } from '@/app/actions/risk-management'
import type {
  InsuranceDashboardData,
  InsurancePolicy,
  ProtectionTarget,
  PolicyWithStatus,
} from '@/types/risk-management'
import type { BudgetMetrics } from '@/types'

type ModalState =
  | { type: 'none' }
  | { type: 'add-policy' }
  | { type: 'edit-policy'; policy: InsurancePolicy }
  | { type: 'set-target' }
  | { type: 'mark-paid'; policy: InsurancePolicy }

interface RiskManagementDashboardProps {
  householdId: string
  insuranceData: InsuranceDashboardData
  healthMetrics?: BudgetMetrics[]
}

type Tab = 'insurance' | 'health'

export function RiskManagementDashboard({
  householdId,
  insuranceData: initial,
  healthMetrics = [],
}: RiskManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('insurance')
  const [modal, setModal] = useState<ModalState>({ type: 'none' })
  const [data, setData] = useState(initial)
  const [, startTransition] = useTransition()

  function handlePolicyCreated(policy: InsurancePolicy) {
    const withStatus: PolicyWithStatus = {
      ...policy,
      premiumStatus: policy.paymentFrequency === 'one-time' ? 'one-time' : 'upcoming',
      daysUntilDue: null,
    }
    setData((prev) => ({
      ...prev,
      policies: [withStatus, ...prev.policies],
      coverageStatus: {
        ...prev.coverageStatus,
        totalCoverage: prev.coverageStatus.totalCoverage + policy.coverageAmount,
      },
    }))
    setModal({ type: 'none' })
  }

  function handlePolicyUpdated(policy: InsurancePolicy) {
    setData((prev) => ({
      ...prev,
      policies: prev.policies.map((p) =>
        p.id === policy.id
          ? { ...policy, premiumStatus: p.premiumStatus, daysUntilDue: p.daysUntilDue }
          : p
      ),
    }))
    setModal({ type: 'none' })
  }

  function handleDeactivate(id: string) {
    startTransition(async () => {
      const result = await deactivateInsurancePolicy(id)
      if (result.success) {
        setData((prev) => ({
          ...prev,
          policies: prev.policies.filter((p) => p.id !== id),
        }))
      }
    })
  }

  function handleTargetSet(target: ProtectionTarget) {
    setData((prev) => ({
      ...prev,
      protectionTarget: target,
      coverageStatus: {
        ...prev.coverageStatus,
        protectionTarget: target.targetAmount,
      },
    }))
    setModal({ type: 'none' })
  }

  function handlePremiumPaid(policyId: string) {
    setData((prev) => ({
      ...prev,
      policies: prev.policies.map((p) =>
        p.id === policyId ? { ...p, premiumStatus: 'paid' as const, daysUntilDue: null } : p
      ),
    }))
    setModal({ type: 'none' })
  }

  const modalPolicy =
    modal.type === 'edit-policy' || modal.type === 'mark-paid' ? modal.policy : null

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('insurance')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'insurance'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Insurance
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'health'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Kesehatan / Health
        </button>
      </div>

      {/* Insurance tab */}
      {activeTab === 'insurance' && (
        <div className="space-y-4">
          <InsuranceSummaryCard
            coverageStatus={data.coverageStatus}
            protectionTarget={data.protectionTarget}
            onSetTarget={() => setModal({ type: 'set-target' })}
          />

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Active Policies
            </h2>
            <button
              onClick={() => setModal({ type: 'add-policy' })}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              + Add Policy
            </button>
          </div>

          <PolicyList
            policies={data.policies}
            onEdit={(p) => setModal({ type: 'edit-policy', policy: p })}
            onDeactivate={handleDeactivate}
            onMarkPaid={(p) => setModal({ type: 'mark-paid', policy: p })}
            onAddPolicy={() => setModal({ type: 'add-policy' })}
          />
        </div>
      )}

      {/* Health tab */}
      {activeTab === 'health' && (
        <HealthBudgetTab householdId={householdId} metrics={healthMetrics} />
      )}

      {/* Modals */}
      {modal.type !== 'none' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal({ type: 'none' })
          }}
        >
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            {modal.type === 'add-policy' && (
              <>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Add Insurance Policy
                </h2>
                <PolicyForm
                  mode="create"
                  householdId={householdId}
                  onSuccess={handlePolicyCreated}
                  onCancel={() => setModal({ type: 'none' })}
                />
              </>
            )}

            {modal.type === 'edit-policy' && modalPolicy && (
              <>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Edit Policy
                </h2>
                <PolicyForm
                  mode="edit"
                  householdId={householdId}
                  initialValues={modalPolicy}
                  onSuccess={handlePolicyUpdated}
                  onCancel={() => setModal({ type: 'none' })}
                />
              </>
            )}

            {modal.type === 'set-target' && (
              <>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {data.protectionTarget ? 'Edit Protection Target' : 'Set Protection Target'}
                </h2>
                <ProtectionTargetForm
                  existingTarget={data.protectionTarget}
                  householdId={householdId}
                  onSuccess={handleTargetSet}
                  onCancel={() => setModal({ type: 'none' })}
                />
              </>
            )}

            {modal.type === 'mark-paid' && modalPolicy && (
              <>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Mark Premium as Paid
                </h2>
                <MarkPaidForm
                  policy={modalPolicy}
                  householdId={householdId}
                  onSuccess={() => handlePremiumPaid(modalPolicy.id)}
                  onCancel={() => setModal({ type: 'none' })}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
