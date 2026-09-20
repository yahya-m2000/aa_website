import { redirect } from "next/navigation";

// Preserve bookmarked links after removing the redundant navigation tab.
export default function OperationsPage() {
  redirect("/admin/orders");
}
