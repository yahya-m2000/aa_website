import type { BadgeProps } from '@/shared/components/ui/badge';
import type { CustomerStatus, InternalStatus } from './types';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

const STATUS_VARIANT: Record<CustomerStatus | InternalStatus, BadgeVariant> = {
  'Order Received': 'neutral',
  'Payment Confirmed': 'success',
  Shipped: 'success',
  Completed: 'success',
  Cancelled: 'danger',
  Expired: 'danger',
  'Awaiting Payment': 'warning',
  'Order Created': 'warning',
  'Needs Review': 'danger',
};

export function statusVariant(status: string): BadgeVariant {
  return STATUS_VARIANT[status as CustomerStatus | InternalStatus] ?? 'neutral';
}

export const CUSTOMER_STATUS_VALUES: CustomerStatus[] = [
  'Order Received',
  'Payment Confirmed',
  'Shipped',
  'Completed',
  'Cancelled',
  'Expired',
];

export const INTERNAL_STATUS_VALUES: InternalStatus[] = [
  'Awaiting Payment',
  'Payment Confirmed',
  'Order Created',
  'Shipped',
  'Completed',
  'Cancelled',
  'Expired',
  'Needs Review',
];
