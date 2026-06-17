import { motion, AnimatePresence } from 'framer-motion';
import type { FloatingText } from '../game/types';

interface EventToastProps {
  floatingTexts: FloatingText[];
}

export default function EventToast({ floatingTexts }: EventToastProps) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-1">
      <AnimatePresence>
        {floatingTexts.map((ft) => (
          <motion.div
            key={ft.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -60, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="font-display font-bold text-lg drop-shadow-lg"
            style={{ color: ft.color }}
          >
            {ft.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
