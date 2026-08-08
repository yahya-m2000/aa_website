import { Badge } from '@/shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { statusVariant } from '@/features/admin-orders/status';
import { MOCK_ORDERS } from '../mock-data';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function OrdersListScene() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-[rgb(var(--foreground))]">Orders</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{MOCK_ORDERS.length} orders shown</p>
      </div>

      <div data-tour="orders-filters" className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="h-11 max-w-sm flex-1 rounded-(--radius) border border-[rgb(var(--input))] px-4 py-2 text-sm text-[rgb(var(--muted-foreground))]">
          Search by reference, name, or email…
        </div>
        <div className="h-11 rounded-(--radius) border border-[rgb(var(--input))] px-4 py-2 text-sm text-[rgb(var(--muted-foreground))]">
          All statuses
        </div>
      </div>

      <div className="rounded-(--radius) border border-[rgb(var(--border))] bg-[rgb(var(--background))]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={false} aria-label="Select all orders" />
              </TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead data-tour="status-column">Status</TableHead>
              <TableHead className="text-center" data-tour="payment-confirmed-column">
                Payment confirmed
              </TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_ORDERS.map((order) => (
              <TableRow key={order.reference} data-tour={order.reference === 'AA-10482' ? 'first-order-row' : undefined}>
                <TableCell>
                  <Checkbox checked={false} aria-label={`Select order ${order.reference}`} />
                </TableCell>
                <TableCell className="font-medium text-[rgb(var(--foreground))]">{order.reference}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{order.customerFullName}</span>
                    <span className="text-xs text-[rgb(var(--muted-foreground))]">{order.customerEmail}</span>
                  </div>
                </TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={statusVariant(order.customerStatus)}>{order.customerStatus}</Badge>
                    {order.internalStatus !== order.customerStatus && (
                      <Badge variant={statusVariant(order.internalStatus)}>{order.internalStatus}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={order.internalStatus === 'Payment Confirmed' || order.internalStatus === 'Order Created'}
                      disabled={order.internalStatus !== 'Awaiting Payment'}
                    />
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">${order.totalUsd.toFixed(2)}</TableCell>
                <TableCell className="text-[rgb(var(--muted-foreground))]">{formatDate(order.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
