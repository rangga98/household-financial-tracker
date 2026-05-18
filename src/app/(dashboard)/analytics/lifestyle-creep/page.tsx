import { LifestyleCreepTracker } from '@/components/features/lifestyle-creep/LifestyleCreepTracker';

export const metadata = {
  title: 'Lifestyle Creep Tracker',
  description: 'Monitor your income vs expense growth trends',
};

export default function LifestyleCreepPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lifestyle Creep Tracker</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Compare your income growth versus expense growth to identify lifestyle creep patterns.
        </p>
      </div>
      
      <LifestyleCreepTracker />
    </div>
  );
}
