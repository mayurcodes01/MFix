import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const glow = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', e.clientX - r.left + 'px');
  e.currentTarget.style.setProperty('--my', e.clientY - r.top + 'px');
};

export const Card = ({ className, ...props }) => (
  <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} onPointerMove={glow} className={cn('glass rounded-3xl text-white', className)} {...props} />
);
export const CardContent = ({ className, ...props }) => <div className={cn('p-5', className)} {...props} />;
