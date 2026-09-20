import Link from "next/link";

export default function OrderNotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <div className="admin-panel">
        <p className="admin-eyebrow">Order not found</p>
        <h1 className="mt-3">Check the reference.</h1>
        <p className="mt-4 text-sm text-[rgb(var(--muted-foreground))]">
          We could not find an order with this reference. Open the order list
          and search by reference, name, or email.
        </p>
        <Link
          href="/admin/orders"
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[rgb(var(--accent))] px-5 text-sm text-white"
        >
          Back to orders
        </Link>
      </div>
    </div>
  );
}
