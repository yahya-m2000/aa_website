import { AdminBackLink } from "@/shared/components/admin-back-link";
import { notFound } from "next/navigation";
import {
  findRecord,
  type DeliveryData,
} from "@/features/admin-automation/records";
import { DeliveryPanel } from "@/features/admin-automation/delivery-panel";
export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const delivery = await findRecord<DeliveryData>("deliveries", key);
  if (!delivery) notFound();
  return (
    <div className="admin-page-transition mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
      <div className="mb-6">
        <AdminBackLink href="/admin/deliveries">All deliveries</AdminBackLink>
      </div>
      <DeliveryPanel key={delivery.etag} delivery={delivery} />
    </div>
  );
}
