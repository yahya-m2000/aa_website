import { Search, CheckCircle, ShoppingCart, TrendingUp } from 'lucide-react';

export const services = [
  {
    key: 'sourcing',
    icon: Search,
  },
  {
    key: 'quality',
    icon: CheckCircle,
  },
  {
    key: 'purchasing',
    icon: ShoppingCart,
  },
  {
    key: 'negotiation',
    icon: TrendingUp,
  },
] as const;

export type ServiceKey = typeof services[number]['key'];
