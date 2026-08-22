"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/core/providers/smooth-scroll-provider";

const SPACING = 40;
const BASE_RADIUS = 1.3;
const HOVER_RADIUS = 4.5;
const HOVER_DISTANCE = 120;
const LINK_INTERVAL = [900, 2200] as const;
const LINK_DURATION = 2200;
const LINK_MAX_DISTANCE = SPACING * 2.2;
const DOT_COLOR = "12, 12, 12";
const ACCENT_COLOR = "59, 24, 147";
const BASE_OPACITY = 0.16;
const HOVER_OPACITY_BOOST = 0.3;
const LINE_OPACITY = 0.4;

/**
 * Radial vignette mask: the grid is strongest near the viewport edges/
 * corners (where copy rarely sits) and fades toward the center (where
 * headlines/paragraphs/cards live), so it reads as ambient texture in the
 * page's own negative space instead of a uniform layer competing with
 * content everywhere.
 */
const VIGNETTE_INNER = 0.35;
const VIGNETTE_OUTER = 0.95;
/** Dots this faint (post-vignette, pre-hover) are visually indistinguishable from invisible - skip drawing them entirely rather than paying for a fill() call that paints ~nothing. */
const VISIBILITY_CUTOFF = 0.01;

/**
 * Rigid-plate tilt: the whole grid shifts as one body based on where the
 * cursor sits relative to the viewport center, like a plate balanced on a
 * central pivot - push near a corner and the entire plate leans that way,
 * rather than any individual dot bulging around the cursor.
 */
const TILT_MAX_SHIFT = 26;
const TILT_MAX_SKEW = 0.05;
const TILT_EASE = 0.06;

interface Dot {
  x: number;
  y: number;
  hover: number;
  accent: boolean;
  /** Precomputed once in buildGrid() - depends only on x/y/viewport size, all static between resizes, so recomputing it per-frame (as the original version did, twice per dot) was pure waste. */
  vignette: number;
}

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

interface Link {
  from: Dot;
  to: Dot;
  start: number;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Fixed, viewport-covering dot grid that stays put while page content
 * scrolls over it. Vignette-masked so it reads strongest at the edges/
 * corners (where copy rarely sits) and fades toward the center (where
 * headlines/paragraphs/cards live), so it sits in the page's own negative
 * space instead of competing with content everywhere. A small fraction of
 * dots/lines pick up the brand accent purple instead of near-black, for a
 * faint tie-back to the site's one deliberate brand color. Dots
 * occasionally grow a connector line that draws to a nearby dot, and the
 * whole grid tilts as a single rigid plate toward the cursor. Lives behind
 * every section that renders a transparent background; Contact/Footer
 * paint their own solid background on top, so nothing extra is needed to
 * "hide" it there.
 *
 * Perf notes (this runs continuously, site-wide, via the root layout, so
 * its per-frame cost is a permanent tax on every scroll/animation budget):
 * - vignette is precomputed once per dot at grid-build time, not
 *   recomputed (twice, involving a sqrt each time) for every dot on every
 *   frame - it only depends on static x/y/viewport size.
 * - Dots below the visibility cutoff (vignette ~0 and not currently
 *   hovered) skip both the hover-distance math and the draw call entirely
 *   - on a 1920x1080 viewport roughly half the ~2,100 dots sit inside the
 *   vignette's faded center and would otherwise still pay for a
 *   beginPath/arc/fill every frame to paint effectively nothing.
 * - Hover-distance math is skipped globally when there's no active
 *   pointer (nothing to lerp toward) so idle pages - most of the time on
 *   touch devices, and any moment the cursor isn't over the canvas -
 *   don't pay for it either.
 */
export function AnimatedDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx2d = canvasEl.getContext("2d");
    if (!ctx2d) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = ctx2d;

    // Touch devices have no real "hover" - a finger dragging to scroll would
    // otherwise fire pointermove and trigger the tilt/dot-growth as an
    // unintended side effect of scrolling. Skip pointer-tracking there
    // entirely and let the grid animate on its own (idle drift + connector
    // lines still run) rather than reacting to touch input at all.
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dots: Dot[] = [];
    const links: Link[] = [];
    const pointer = { x: -9999, y: -9999 };
    const tilt = { x: 0, y: 0, skewX: 0, skewY: 0 };

    /**
     * 0 at viewport center, 1 at/beyond the outer radius - keeps the grid
     * faint behind headline/paragraph space in the middle of the screen
     * and lets it read at near-full strength toward the edges/corners.
     * Only ever called at grid-build time now (see Dot.vignette).
     */
    function computeVignette(x: number, y: number) {
      const cx = width / 2;
      const cy = height / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist;
      const t = Math.max(0, Math.min(1, (dist - VIGNETTE_INNER) / (VIGNETTE_OUTER - VIGNETTE_INNER)));
      return easeInOutQuad(t);
    }

    function buildGrid() {
      dots = [];
      // Overscan beyond the viewport so the rigid-plate tilt/skew never
      // reveals an empty edge as the grid shifts.
      const overscan = Math.ceil((TILT_MAX_SHIFT + width * TILT_MAX_SKEW) / SPACING) + 1;
      const cols = Math.ceil(width / SPACING) + overscan * 2;
      const rows = Math.ceil(height / SPACING) + overscan * 2;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = (col - overscan) * SPACING;
          const y = (row - overscan) * SPACING;
          dots.push({
            x,
            y,
            hover: 0,
            accent: Math.random() < 0.06,
            vignette: computeVignette(x, y),
          });
        }
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    resize();
    window.addEventListener("resize", resize);

    function onPointerMove(e: PointerEvent) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
    function onPointerLeave() {
      pointer.x = -9999;
      pointer.y = -9999;
    }
    if (!isCoarsePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);
    }

    if (reduced) {
      ctx.clearRect(0, 0, width, height);
      for (const dot of dots) {
        if (dot.vignette < VISIBILITY_CUTOFF) continue;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, BASE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dot.accent ? ACCENT_COLOR : DOT_COLOR}, ${BASE_OPACITY * dot.vignette})`;
        ctx.fill();
      }
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
      };
    }

    let rafId: number;
    let nextLinkAt = performance.now() + randomBetween(...LINK_INTERVAL);

    function randomBetween(min: number, max: number) {
      return min + Math.random() * (max - min);
    }

    function maybeSpawnLink(now: number) {
      if (now < nextLinkAt || dots.length < 2) return;
      nextLinkAt = now + randomBetween(...LINK_INTERVAL);

      const from = dots[Math.floor(Math.random() * dots.length)];
      const candidates = dots.filter((d) => {
        if (d === from) return false;
        const dx = d.x - from.x;
        const dy = d.y - from.y;
        return Math.sqrt(dx * dx + dy * dy) <= LINK_MAX_DISTANCE;
      });
      if (candidates.length === 0) return;
      const to = candidates[Math.floor(Math.random() * candidates.length)];
      links.push({ from, to, start: now });
    }

    function draw(now: number) {
      // Rigid-plate tilt: cursor position relative to viewport center drives
      // a uniform shift + skew applied to the whole grid at once, eased
      // toward the target each frame so the plate settles rather than snaps.
      const hasPointer = pointer.x > -9000;
      const normX = hasPointer ? (pointer.x - width / 2) / (width / 2) : 0;
      const normY = hasPointer ? (pointer.y - height / 2) / (height / 2) : 0;
      const clampedX = Math.max(-1, Math.min(1, normX));
      const clampedY = Math.max(-1, Math.min(1, normY));

      tilt.x += (clampedX * TILT_MAX_SHIFT - tilt.x) * TILT_EASE;
      tilt.y += (clampedY * TILT_MAX_SHIFT - tilt.y) * TILT_EASE;
      tilt.skewX += (clampedX * TILT_MAX_SKEW - tilt.skewX) * TILT_EASE;
      tilt.skewY += (clampedY * TILT_MAX_SKEW - tilt.skewY) * TILT_EASE;

      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.translate(width / 2, height / 2);
      ctx.transform(1, tilt.skewY, tilt.skewX, 1, 0, 0);
      ctx.translate(-width / 2 + tilt.x, -height / 2 + tilt.y);

      maybeSpawnLink(now);

      // Hover-distance math is the one genuinely per-frame-variable value a
      // dot needs - skip it entirely when there's no pointer active (hover
      // just decays toward 0, which a static short-circuit below handles).
      if (hasPointer) {
        for (const dot of dots) {
          const dx = dot.x - pointer.x;
          const dy = dot.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const hoverProximity = Math.max(0, 1 - dist / HOVER_DISTANCE);
          const targetHover = hoverProximity * hoverProximity;
          dot.hover += (targetHover - dot.hover) * 0.15;
        }
      } else {
        for (const dot of dots) {
          if (dot.hover > 0.001) dot.hover *= 0.85;
          else if (dot.hover !== 0) dot.hover = 0;
        }
      }

      // Connector lines: each draws progressively from its start dot to its
      // end dot with an eased pace, holds fully drawn, then is removed -
      // no opacity fade, the line simply completes and stays until it's done.
      for (let i = links.length - 1; i >= 0; i--) {
        const link = links[i];
        const t = Math.min(1, (now - link.start) / LINK_DURATION);
        if (t >= 1) {
          links.splice(i, 1);
          continue;
        }
        const drawT = easeInOutCubic(t);
        const endX = link.from.x + (link.to.x - link.from.x) * drawT;
        const endY = link.from.y + (link.to.y - link.from.y) * drawT;
        const midT = drawT / 2;
        const midVignette = link.from.vignette + (link.to.vignette - link.from.vignette) * midT;
        const lineColor = link.from.accent || link.to.accent ? ACCENT_COLOR : DOT_COLOR;

        ctx.beginPath();
        ctx.moveTo(link.from.x, link.from.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(${lineColor}, ${LINE_OPACITY * midVignette})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (const dot of dots) {
        // Skip dots that would paint effectively nothing - on a full HD
        // viewport roughly half the grid sits inside the vignette's faded
        // center at any given moment, and this is the single cheapest,
        // highest-leverage cut available since it skips the draw call
        // entirely rather than just the math feeding it.
        if (dot.hover < VISIBILITY_CUTOFF && dot.vignette < VISIBILITY_CUTOFF) continue;

        const radius = BASE_RADIUS + (HOVER_RADIUS - BASE_RADIUS) * dot.hover;
        const baseOpacity = BASE_OPACITY + HOVER_OPACITY_BOOST * dot.hover;
        const opacity = baseOpacity * Math.max(dot.hover, dot.vignette);
        const color = dot.accent ? ACCENT_COLOR : DOT_COLOR;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${opacity})`;
        ctx.fill();
      }

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
