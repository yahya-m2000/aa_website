import { hasVerifiedPayment, orderContentsIdentity } from './procurement-contract';
import { findRecord, type OperationData } from './records';
import type { OrderListItemFields } from '../admin-orders/types';
export async function requireVerifiedSupplierPayment(reference: string, fields: OrderListItemFields) {
  const supplierId = fields.HiobuyOrderId;
  const operation = supplierId ? await findRecord<OperationData>('operations', `pay:${supplierId}`) : null;
  if (!hasVerifiedPayment(operation, reference, supplierId, orderContentsIdentity(fields)))
    throw new Error('All supplier purchases must have verified item coverage, amounts and payments before fulfillment.');
}
