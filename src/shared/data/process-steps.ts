import { Search, Ship, ClipboardCheck, PackageCheck } from 'lucide-react';

export const processSteps = [
  {
    key: 'sourcing',
    icon: Search,
  },
  {
    key: 'shipping',
    icon: Ship,
  },
  {
    key: 'customs',
    icon: ClipboardCheck,
  },
  {
    key: 'delivery',
    icon: PackageCheck,
  },
] as const;

export type ProcessStepKey = typeof processSteps[number]['key'];
