import { Swimlane, RoadmapItem, getEpicColor } from './data';

/**
 * Demo data for fallback when CSV fails to load
 * This allows users to see how the dashboard works even without real data
 */

const today = new Date();
const daysAgo = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

const demoItems: Record<string, RoadmapItem[]> = {
  'Payment Gateway Integration': [
    {
      id: 'DEMO-001',
      title: 'Payment Provider Setup',
      owner: 'John',
      status: 'Complete',
      startDate: daysAgo(30),
      endDate: daysAgo(15),
      effort: '10 days',
      impact: 'High',
      dependencies: [],
      notes: 'Demo item - Initial provider configuration',
      comments: [],
      subItems: [],
    },
    {
      id: 'DEMO-002',
      title: 'API Integration',
      owner: 'Sarah',
      status: 'In Progress',
      startDate: daysAgo(14),
      endDate: daysFromNow(7),
      effort: '15 days',
      impact: 'High',
      dependencies: ['DEMO-001'],
      notes: 'Demo item - Building REST API connections',
      comments: [],
      subItems: [],
    },
    {
      id: 'DEMO-003',
      title: 'Security Audit',
      owner: 'Mike',
      status: 'Not Started',
      startDate: daysFromNow(8),
      endDate: daysFromNow(22),
      effort: '10 days',
      impact: 'High',
      dependencies: ['DEMO-002'],
      notes: 'Demo item - PCI compliance review',
      comments: [],
      subItems: [],
    },
  ],
  'User Experience': [
    {
      id: 'DEMO-004',
      title: 'Checkout Flow Redesign',
      owner: 'Emma',
      status: 'In Progress',
      startDate: daysAgo(20),
      endDate: daysFromNow(5),
      effort: '20 days',
      impact: 'Medium',
      dependencies: [],
      notes: 'Demo item - Streamlining the checkout process',
      comments: [],
      subItems: [],
    },
    {
      id: 'DEMO-005',
      title: 'Mobile Optimization',
      owner: 'Alex',
      status: 'Blocked',
      startDate: daysAgo(5),
      endDate: daysFromNow(15),
      effort: '12 days',
      impact: 'Medium',
      dependencies: ['DEMO-004'],
      notes: 'Demo item - Blocked on design assets',
      comments: [],
      subItems: [],
    },
  ],
  'Analytics & Reporting': [
    {
      id: 'DEMO-006',
      title: 'Dashboard Metrics',
      owner: 'Chris',
      status: 'Complete',
      startDate: daysAgo(45),
      endDate: daysAgo(25),
      effort: '15 days',
      impact: 'Medium',
      dependencies: [],
      notes: 'Demo item - Key performance indicators',
      comments: [],
      subItems: [],
    },
    {
      id: 'DEMO-007',
      title: 'Export Reports',
      owner: 'Chris',
      status: 'Not Started',
      startDate: daysFromNow(10),
      endDate: daysFromNow(25),
      effort: '8 days',
      impact: 'Low',
      dependencies: ['DEMO-006'],
      notes: 'Demo item - PDF and Excel export',
      comments: [],
      subItems: [],
    },
  ],
};

export const demoSwimlanes: Swimlane[] = Object.entries(demoItems).map(([title, items], index) => ({
  id: `demo-lane-${index + 1}`,
  title,
  color: getEpicColor(title),
  items,
}));

export const isDemoData = (swimlanes: Swimlane[]): boolean => {
  return swimlanes.length > 0 && swimlanes[0].items.some(item => item.id.startsWith('DEMO-'));
};
