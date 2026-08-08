'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/core/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer group h-5 w-5 shrink-0 cursor-pointer rounded-[4px] border-2 border-[rgb(var(--border))] bg-transparent transition-colors',
      'not-data-[state=checked]:hover:border-[rgb(var(--accent))] not-data-[state=checked]:hover:bg-[rgb(var(--accent))]/10',
      'data-[state=checked]:border-[rgb(var(--accent))] data-[state=checked]:bg-[rgb(var(--accent))]',
      'data-[state=checked]:hover:border-[rgb(var(--accent-hover))] data-[state=checked]:hover:bg-[rgb(var(--accent-hover))]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:border-[rgb(var(--border))] disabled:bg-transparent disabled:opacity-50 disabled:hover:border-[rgb(var(--border))] disabled:hover:bg-transparent',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-[rgb(var(--accent-foreground))]">
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
