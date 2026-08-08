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

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dots: Dot[] = [];
    const links: Link[] = [];
    const pointer = { x: -9999, y: -9999 };
    const tilt = { x: 0, y: 0, skewX: 0, skewY: 0 };

    function buildGrid() {
      dots = [];
      // Overscan beyond the viewport so the rigid-plate tilt/skew never
      // reveals an empty edge as the grid shifts.
      const overscan = Math.ceil((TILT_MAX_SHIFT + width * TILT_MAX_SKEW) / SPACING) + 1;
      const cols = Math.ceil(width / SPACING) + overscan * 2;
      const rows = Math.ceil(height / SPACING) + overscan * 2;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          dots.push({
            x: (col - overscan) * SPACING,
            y: (row - overscan) * SPACING,
            hover: 0,
            accent: Math.random() < 0.06,
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
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    if (reduced) {
      ctx.clearRect(0, 0, width, height);
      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, BASE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dot.accent ? ACCENT_COLOR : DOT_COLOR}, ${BASE_OPACITY * vignette(dot.x, dot.y)})`;
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

    /**
     * 0 at viewport center, 1 at/beyond the outer radius - keeps the grid
     * faint behind headline/paragraph space in the middle of the screen
     * and lets it read at near-full strength toward the edges/corners.
     */
    function vignette(x: number, y: number) {
      const cx = width / 2;
      const cy = height / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist;
      const t = Math.max(0, Math.min(1, (dist - VIGNETTE_INNER) / (VIGNETTE_OUTER - VIGNETTE_INNER)));
      return easeInOutQuad(t);
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

      for (const dot of dots) {
        const dx = dot.x - pointer.x;
        const dy = dot.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hoverProximity = Math.max(0, 1 - dist / HOVER_DISTANCE);
        const targetHover = hoverProximity * hoverProximity;
        dot.hover += (targetHover - dot.hover) * 0.15;
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
        const midX = (link.from.x + endX) / 2;
        const midY = (link.from.y + endY) / 2;
        const lineColor = link.from.accent || link.to.accent ? ACCENT_COLOR : DOT_COLOR;

        ctx.beginPath();
        ctx.moveTo(link.from.x, link.from.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(${lineColor}, ${LINE_OPACITY * vignette(midX, midY)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (const dot of dots) {
        const radius = BASE_RADIUS + (HOVER_RADIUS - BASE_RADIUS) * dot.hover;
        const baseOpacity = BASE_OPACITY + HOVER_OPACITY_BOOST * dot.hover;
        const opacity = baseOpacity * Math.max(dot.hover, vignette(dot.x, dot.y));
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
