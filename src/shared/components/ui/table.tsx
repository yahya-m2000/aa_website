import * as React from 'react';
import { cn } from '@/core/utils';

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    // The scroll-shadow background-attachment:local trick: two radial-gradient
    // "shadow" images pinned to the scrolling content (so they move with it and
    // vanish at each true start/end) plus two solid-color images pinned to the
    // viewport (covering the shadows unless there's actually more content off-
    // screen in that direction). Net effect: a fade cue appears on whichever
    // edge(s) currently have hidden content, with zero JS scroll tracking - the
    // dense 8-column orders table otherwise scrolled on mobile with no visual
    // hint that Total/Created were off-screen.
    <div
      className="w-full overflow-x-auto"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgb(var(--background)) 30%, transparent), linear-gradient(to right, transparent, rgb(var(--background)) 70%), linear-gradient(to right, rgb(0 0 0 / 0.08), transparent 20px), linear-gradient(to left, rgb(0 0 0 / 0.08), transparent 20px)',
        backgroundPosition: 'left center, right center, left center, right center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '40px 100%, 40px 100%, 20px 100%, 20px 100%',
        backgroundAttachment: 'local, local, scroll, scroll',
      }}
    >
      <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('border-b border-[rgb(var(--border))]', className)} {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y divide-[rgb(var(--border))]', className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn('transition-colors hover:bg-[rgb(var(--muted))]', className)}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-10 px-4 text-left align-middle text-xs font-medium tracking-wide text-[rgb(var(--muted-foreground))] uppercase',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn('px-4 py-3 align-middle', className)} {...props} />
  )
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
