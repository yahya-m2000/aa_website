import type { CustomerStatus, InternalStatus } from '@/features/admin-orders/types';

export interface MockOrderRow {
  reference: string;
  customerFullName: string;
  customerEmail: string;
  paymentMethod: 'Cash' | 'Zaad';
  customerStatus: CustomerStatus;
  internalStatus: InternalStatus;
  totalUsd: number;
  createdAt: string;
}

// A spread of statuses so the Orders-list scene can point at real rows in different
// states side by side, instead of describing statuses only in the abstract.
export const MOCK_ORDERS: MockOrderRow[] = [
  {
    reference: 'AA-10482',
    customerFullName: 'Amina Yusuf',
    customerEmail: 'amina@example.com',
    paymentMethod: 'Zaad',
    customerStatus: 'Order Received',
    internalStatus: 'Awaiting Payment',
    totalUsd: 190,
    createdAt: '2026-08-08T09:14:00Z',
  },
  {
    reference: 'AA-10481',
    customerFullName: 'Cabdi Rashid',
    customerEmail: 'cabdi@example.com',
    paymentMethod: 'Cash',
    customerStatus: 'Payment Confirmed',
    internalStatus: 'Order Created',
    totalUsd: 340,
    createdAt: '2026-08-07T14:02:00Z',
  },
  {
    reference: 'AA-10477',
    customerFullName: 'Sahra Ismail',
    customerEmail: 'sahra@example.com',
    paymentMethod: 'Zaad',
    customerStatus: 'Shipped',
    internalStatus: 'Shipped',
    totalUsd: 512,
    createdAt: '2026-08-05T11:40:00Z',
  },
  {
    reference: 'AA-10470',
    customerFullName: 'Mohamed Farah',
    customerEmail: 'mfarah@example.com',
    paymentMethod: 'Cash',
    customerStatus: 'Completed',
    internalStatus: 'Completed',
    totalUsd: 275,
    createdAt: '2026-08-01T08:20:00Z',
  },
  {
    reference: 'AA-10465',
    customerFullName: 'Hodan Warsame',
    customerEmail: 'hodan@example.com',
    paymentMethod: 'Zaad',
    customerStatus: 'Expired',
    internalStatus: 'Expired',
    totalUsd: 98,
    createdAt: '2026-07-30T16:55:00Z',
  },
];

export const MOCK_REVENUE_SERIES = [
  { date: '2026-07-15', orders: 2, revenueUsd: 24 },
  { date: '2026-07-18', orders: 3, revenueUsd: 41 },
  { date: '2026-07-22', orders: 1, revenueUsd: 12 },
  { date: '2026-07-25', orders: 4, revenueUsd: 58 },
  { date: '2026-07-29', orders: 3, revenueUsd: 45 },
  { date: '2026-08-02', orders: 5, revenueUsd: 71 },
  { date: '2026-08-06', orders: 4, revenueUsd: 63 },
];

export const MOCK_STATUS_BREAKDOWN: Array<{ status: CustomerStatus; count: number }> = [
  { status: 'Order Received', count: 6 },
  { status: 'Payment Confirmed', count: 9 },
  { status: 'Shipped', count: 5 },
  { status: 'Completed', count: 14 },
  { status: 'Cancelled', count: 2 },
  { status: 'Expired', count: 1 },
];

export const MOCK_COUNTRY_BREAKDOWN = [
  { country: 'Somaliland', count: 24, totalUsd: 5120 },
  { country: 'Somalia', count: 9, totalUsd: 1840 },
  { country: 'Ethiopia', count: 4, totalUsd: 610 },
];
