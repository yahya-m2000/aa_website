import { Package, Truck, Warehouse, FileCheck } from 'lucide-react';

export const services = [
  {
    key: 'procurement',
    icon: Package,
  },
  {
    key: 'logistics',
    icon: Truck,
  },
  {
    key: 'warehousing',
    icon: Warehouse,
  },
  {
    key: 'customs',
    icon: FileCheck,
  },
] as const;

export type ServiceKey = typeof services[number]['key'];
