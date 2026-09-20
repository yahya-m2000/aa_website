import { workerControl } from "./records";
export async function AutomationNotice() {
  try {
    const control = await workerControl();
    if (
      control?.data.enabled &&
      control.data.heartbeat &&
      Date.now() - Date.parse(control.data.heartbeat) < 120000
    )
      return null;
  } catch {
    /* An unavailable queue must not look ready for purchasing. */
  }
  return (
    <p
      role="status"
      className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      Supplier automation is paused or unavailable. New payment actions will be
      accepted once the server is ready; existing orders remain available.
    </p>
  );
}
