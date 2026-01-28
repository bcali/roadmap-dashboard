import { countByStatus } from '../utils/dataTransforms';

export default function SummaryCards({ data }) {
  const counts = countByStatus(data);

  const cards = [
    {
      label: 'Complete',
      count: counts['Complete'],
      color: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      icon: '✓',
    },
    {
      label: 'In Progress',
      count: counts['In Progress'],
      color: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      icon: '⟳',
    },
    {
      label: 'Blocked',
      count: counts['Blocked'],
      color: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      icon: '!',
    },
    {
      label: 'Not Started',
      count: counts['Not Started'],
      color: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      icon: '○',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.color} ${card.borderColor} border-2 rounded-lg p-4 transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{card.label}</p>
              <p className={`text-3xl font-bold ${card.textColor} mt-1`}>{card.count}</p>
            </div>
            <div className={`text-3xl ${card.textColor} opacity-50`}>{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
