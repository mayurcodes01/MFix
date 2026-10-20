import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export const Switch = ({ className, ...props }) => (
  <SwitchPrimitive.Root className={cn('peer h-6 w-11 shrink-0 rounded-full border border-white/20 bg-white/10 transition outline-none focus-visible:ring-2 focus-visible:ring-white/60 data-[state=checked]:bg-[var(--c2)]', className)} {...props}>
    <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
  </SwitchPrimitive.Root>
);
