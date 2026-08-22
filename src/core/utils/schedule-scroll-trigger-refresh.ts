import { ScrollTrigger } from "gsap/ScrollTrigger";

let scheduled = false;

/**
 * Coalesces same-frame ScrollTrigger.refresh() calls into a single real
 * refresh. ScrollTrigger.refresh() recalculates start/end positions for
 * EVERY active trigger on the page, not just the caller's own - several
 * components (SplitHeading, Parallax) each call it once on mount for
 * correctness (Strict Mode re-mounts, elements already in the viewport on
 * load), and with up to a dozen instances mounting during initial
 * homepage hydration, calling it directly meant that many redundant
 * full-page refresh passes stacking up back to back. Batching them into
 * one rAF-deferred call keeps the same correctness guarantee (still
 * refreshes after the DOM settles) at a fraction of the cost.
 */
export function scheduleScrollTriggerRefresh() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    ScrollTrigger.refresh();
  });
}
