import type { OperationData } from './procurement-contract';
import { isCompleteManifest, isFullyPaid } from './procurement-contract';

export function procurementStatusLabel(state: string, data: OperationData, contentsIdentity: string): string {
  if (state === 'Dispatching') return 'Processing';
  if (state === 'Review') return 'Needs review';
  if (state !== 'Succeeded') return state;
  const verified = data.kind === 'pay' ? isFullyPaid(data.manifest) : isCompleteManifest(data.manifest);
  return verified && data.orderContentsIdentity === contentsIdentity ? 'Complete' : 'Unverified - review required';
}

export function ProcurementSummary({ data, contentsIdentity }: { data: OperationData; contentsIdentity: string }) {
  const manifest = data.manifest;
  if (!manifest) {
    return <p role="status" className="mt-2 text-amber-700">
      Supplier completeness is unverified. This older record needs an audit before fulfillment.
    </p>;
  }
  const paid = manifest.orders.filter(o => o.payment.state === 'Paid');
  const paidPurchaseTotal = paid.reduce((n, o) => n + o.purchaseCnyMinor, 0);
  const matchesOrder = data.orderContentsIdentity === contentsIdentity;
  return <div className="mt-2 space-y-2 text-sm">
    <p>{manifest.orders.length} supplier purchases recorded; {paid.length} paid. {manifest.sellers.length} seller groups expected.</p>
    <p>
      Expected purchase total: CNY {(manifest.expectedTotalCnyMinor / 100).toFixed(2)}.
      {' '}Verified paid purchases: CNY {(paidPurchaseTotal / 100).toFixed(2)}.
    </p>
    {(!matchesOrder || (data.kind === 'pay' && !isFullyPaid(manifest))) &&
      <p role="status" className="text-amber-700">Payment is incomplete or unverified for this order. Fulfillment is blocked.</p>}
    <ul className="space-y-1">
      {manifest.orders.map(o => <li key={o.orderId}>
        {o.orderId}: {o.payment.state} - purchase CNY {(o.purchaseCnyMinor / 100).toFixed(2)}
        {o.payment.settledCurrency && o.payment.settledAmountMinor !== undefined && <>
          ; settled {o.payment.settledCurrency} {(o.payment.settledAmountMinor / 100).toFixed(2)}
        </>}
      </li>)}
    </ul>
  </div>;
}
