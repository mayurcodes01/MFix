import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-white/60',
  {
    variants: {
      variant: {
        default: 'text-white shadow-lg bg-[linear-gradient(90deg,var(--c1),var(--c2))] hover:brightness-110',
        glass: 'glass text-white hover:bg-white/10',
        ghost: 'text-white/70 hover:text-white hover:bg-white/10',
      },
      size: { default: 'h-10 px-5', sm: 'h-8 px-3 text-xs', icon: 'h-10 w-10' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export const Button = ({ className, variant, size, asChild, ...props }) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(variants({ variant, size }), className)} {...props} />;
};
