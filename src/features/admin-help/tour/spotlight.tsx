'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  /** The target's own computed corner radius, so the spotlight ring/cutout matches its
   * actual shape instead of a fixed guess — a plain <div>/<td> has square corners, a
   * Card has rounded ones, and the ring looked like a mismatched sticker when it assumed
   * one radius for every target. */
  radius: number;
}

const PADDING = 8;
const CALLOUT_WIDTH = 340;
const CALLOUT_GAP = 16;
const VIEWPORT_MARGIN = 16;
const TRANSITION = 'all 450ms cubic-bezier(0.22, 1, 0.36, 1)';

/** An SVG path `d` string for a rounded rect, used as the inner (hole) subpath of the
 * overlay's evenodd clip-path. Clamps radius so it can never exceed half the shorter side
 * (an oversized radius would otherwise distort into an invalid/self-intersecting path). */
function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  if (radius === 0) {
    return `M${x},${y} H${x + w} V${y + h} H${x} Z`;
  }
  return [
    `M${x + radius},${y}`,
    `H${x + w - radius}`,
    `A${radius},${radius} 0 0 1 ${x + w},${y + radius}`,
    `V${y + h - radius}`,
    `A${radius},${radius} 0 0 1 ${x + w - radius},${y + h}`,
    `H${x + radius}`,
    `A${radius},${radius} 0 0 1 ${x},${y + h - radius}`,
    `V${y + radius}`,
    `A${radius},${radius} 0 0 1 ${x + radius},${y}`,
    'Z',
  ].join(' ');
}

function readRadius(el: Element): number {
  const value = window.getComputedStyle(el).borderTopLeftRadius;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Tracks the live screen position (and corner radius) of the element
 * carrying data-tour="target" for as long as it's mounted. Re-measures via
 * a ResizeObserver on the element itself plus scroll/resize listeners, so
 * layout shifts caused by the tour's own state changes (a card appearing,
 * text changing height) are caught immediately.
 */
function useTargetRect(target: string): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    let el: Element | null = null;
    let ro: ResizeObserver | null = null;
    let cancelled = false;

    function measure() {
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height, radius: readRadius(el) });
    }

    function attach() {
      if (cancelled) return;
      const found = document.querySelector(`[data-tour="${target}"]`);
      if (!found) {
        // Target not mounted yet — keep polling briefly rather than giving up, since a
        // beat can be entered right after a state change that mounts a new card.
        window.setTimeout(attach, 50);
        return;
      }
      if (el !== found) {
        ro?.disconnect();
        el = found;
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        ro = new ResizeObserver(measure);
        ro.observe(el);
      }
      measure();
    }

    attach();
    window.addEventListener('scroll', measure, { passive: true, capture: true });
    window.addEventListener('resize', measure);

    return () => {
      cancelled = true;
      ro?.disconnect();
      window.removeEventListener('scroll', measure, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', measure);
    };
    // Deliberately re-runs on every target change (new beat) so `attach` re-queries the DOM
    // for the new data-tour id — but stays a single continuous effect lifecycle rather than
    // forcing the whole Spotlight to unmount/remount between beats.
  }, [target]);

  return rect;
}

export type Placement = 'top' | 'bottom' | 'left' | 'right';

interface CalloutPos {
  top: number;
  left: number;
}

/**
 * Positions the callout using its OWN measured height (not a guess) so it can never be
 * clamped partially off-screen.
 */
function calloutPosition(rect: Rect, placement: Placement | undefined, calloutHeight: number): CalloutPos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const preferred = placement ?? 'bottom';

  const fits: Record<Placement, boolean> = {
    bottom: rect.top + rect.height + CALLOUT_GAP + calloutHeight + VIEWPORT_MARGIN < vh,
    top: rect.top - CALLOUT_GAP - calloutHeight - VIEWPORT_MARGIN > 0,
    right: rect.left + rect.width + CALLOUT_GAP + CALLOUT_WIDTH + VIEWPORT_MARGIN < vw,
    left: rect.left - CALLOUT_GAP - CALLOUT_WIDTH - VIEWPORT_MARGIN > 0,
  };

  const order: Placement[] = [preferred, 'right', 'bottom', 'left', 'top'];
  const side = order.find((s) => fits[s]) ?? preferred;

  const clampX = (x: number) => Math.min(Math.max(VIEWPORT_MARGIN, x), vw - CALLOUT_WIDTH - VIEWPORT_MARGIN);
  const clampY = (y: number) => Math.min(Math.max(VIEWPORT_MARGIN, y), vh - calloutHeight - VIEWPORT_MARGIN);

  switch (side) {
    case 'bottom':
      return { top: clampY(rect.top + rect.height + CALLOUT_GAP), left: clampX(rect.left) };
    case 'top':
      return { top: clampY(rect.top - CALLOUT_GAP - calloutHeight), left: clampX(rect.left) };
    case 'right':
      return { top: clampY(rect.top), left: clampX(rect.left + rect.width + CALLOUT_GAP) };
    case 'left':
      return { top: clampY(rect.top), left: clampX(rect.left - CALLOUT_GAP - CALLOUT_WIDTH) };
  }
}

export interface SpotlightProps {
  target: string;
  title: string;
  body: string;
  placement?: Placement;
  stepLabel: string;
  onNext: () => void;
  onBack?: () => void;
  onExit: () => void;
  isLastBeat: boolean;
}

export function Spotlight({ target, title, body, placement, stepLabel, onNext, onBack, onExit, isLastBeat }: SpotlightProps) {
  const rect = useTargetRect(target);
  const calloutRef = useRef<HTMLDivElement>(null);
  const [calloutHeight, setCalloutHeight] = useState(180);

  // Re-measure the callout's real height whenever its content changes (a new beat's title/
  // body is a different length), so calloutPosition's viewport-fit math is always accurate.
  useLayoutEffect(() => {
    if (calloutRef.current) {
      setCalloutHeight(calloutRef.current.offsetHeight);
    }
  }, [title, body, stepLabel]);

  if (!rect) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
        <div className="w-80 rounded-(--radius) bg-[rgb(var(--background))] p-5 shadow-2xl">
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Loading…</p>
        </div>
      </div>
    );
  }

  const holeTop = rect.top - PADDING;
  const holeLeft = rect.left - PADDING;
  const holeWidth = rect.width + PADDING * 2;
  const holeHeight = rect.height + PADDING * 2;
  const holeRadius = rect.radius + PADDING * 0.5;
  const pos = calloutPosition(rect, placement, calloutHeight);
  const holePath = roundedRectPath(holeLeft, holeTop, holeWidth, holeHeight, holeRadius);
  const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
  // clip-path: path(evenodd, ...) with an outer full-viewport rect + an inner rounded-rect
  // hole punches a single, atomic cutout shape — one element, one animated path, so the
  // dim + blur can never visually desync mid-transition the way four independently
  // animated panel divs could (that four-panel mismatch was the "splits apart" glitch).
  const clipPath = `path(evenodd, "M0,0 H${vw} V${vh} H0 Z ${holePath}")`;

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Dim layer + frosted-glass blur, both clipped by the same single cutout shape so
          they move as one coordinated unit and the blur/dim only ever apply outside the
          spotlighted element. */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[3px]"
        style={{ clipPath, transition: TRANSITION }}
      />

      <div
        className="pointer-events-none absolute ring-2 ring-[rgb(var(--accent))] ring-offset-0"
        style={{
          top: holeTop,
          left: holeLeft,
          width: holeWidth,
          height: holeHeight,
          borderRadius: holeRadius,
          transition: TRANSITION,
          boxShadow: '0 0 0 4px rgb(var(--accent) / 0.15)',
        }}
      />

      <div
        ref={calloutRef}
        className="absolute rounded-(--radius) bg-[rgb(var(--background))] p-5 shadow-2xl"
        style={{ top: pos.top, left: pos.left, width: CALLOUT_WIDTH, transition: TRANSITION }}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--accent))]">{stepLabel}</p>
          <button
            type="button"
            onClick={onExit}
            className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            aria-label="Exit tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="mb-1.5 font-display text-base font-semibold text-[rgb(var(--foreground))]">{title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-[rgb(var(--muted-foreground))]">{body}</p>
        <div className="flex items-center justify-between">
          {onBack ? (
            <Button variant="ghost" size="sm" onClick={onBack}>
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button variant="accent" size="sm" onClick={onNext}>
            {isLastBeat ? 'Continue' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
