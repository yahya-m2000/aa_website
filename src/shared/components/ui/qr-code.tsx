"use client";

import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/core/utils";

export interface QrCodeProps {
  /** Full absolute URL to encode - QR codes need an absolute URL to be scannable from any device. */
  value: string;
  size?: number;
  className?: string;
}

/**
 * Renders entirely client-side via qrcode.react (SVG, zero network calls) -
 * deliberately not an external QR-image API, since that would leak the
 * encoded URL to a third party and add an outage dependency for something
 * as basic as a working link.
 */
export function QrCode({ value, size = 128, className }: QrCodeProps) {
  return (
    <div className={cn("inline-flex items-center justify-center rounded-(--radius) bg-white p-3", className)}>
      <QRCodeSVG
        value={value}
        size={size}
        // High error-correction: this sits printed/screenshotted at small
        // sizes in the real world, so it needs headroom for smudges/glare.
        level="H"
        fgColor="rgb(12, 12, 12)"
        bgColor="transparent"
      />
    </div>
  );
}
