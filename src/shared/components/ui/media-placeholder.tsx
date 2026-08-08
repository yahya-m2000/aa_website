import * as React from 'react';
import { ImageIcon, PlayCircle } from 'lucide-react';
import { cn } from '@/core/utils';

export interface MediaPlaceholderProps {
  type: 'image' | 'video';
  label: string;
  aspectRatio?: string;
  size?: 'default' | 'compact';
  /**
   * 'card' (default) renders its own bordered/rounded box, sized by
   * aspectRatio. 'fill' renders as an absolute inset-0 layer with no
   * border/radius/aspect-ratio of its own, for use as a background behind
   * an overlay + text (e.g. a photo-card with a dark scrim on top).
   */
  variant?: 'card' | 'fill';
  className?: string;
}

export function MediaPlaceholder({
  type,
  label,
  aspectRatio,
  size = 'default',
  variant = 'card',
  className,
}: MediaPlaceholderProps) {
  const Icon = type === 'video' ? PlayCircle : ImageIcon;
  const isCompact = size === 'compact';
  const isFill = variant === 'fill';

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-[rgb(var(--muted))]',
        isFill
          ? 'absolute inset-0'
          : cn(
              'rounded-(--radius) border border-[rgb(var(--border))]',
              aspectRatio ?? (type === 'video' ? 'aspect-video' : 'aspect-[4/5]')
            ),
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: isCompact ? '12px 12px' : '32px 32px',
        }}
      />
      <div
        className={cn(
          'relative z-10 flex flex-col items-center text-center',
          isCompact ? 'gap-0' : 'gap-3 px-6'
        )}
      >
        <Icon
          className={isCompact ? 'w-4 h-4 text-[rgb(var(--muted-foreground))]' : 'w-10 h-10 text-[rgb(var(--muted-foreground))]'}
          strokeWidth={1.25}
        />
        {!isCompact && label && (
          <span className="text-xs font-medium uppercase tracking-widest text-[rgb(var(--muted-foreground))]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
