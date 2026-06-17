import { motion } from 'framer-motion';

interface StatBarProps {
  icon: string;
  label: string;
  value: number;
  max?: number;
}

function barColor(v: number): string {
  if (v > 66) return 'from-emerald-500 to-emerald-400';
  if (v > 33) return 'from-amber-500 to-amber-400';
  return 'from-red-500 to-red-400';
}

function textColor(v: number): string {
  if (v > 66) return 'text-emerald-400';
  if (v > 33) return 'text-amber-400';
  return 'text-red-400';
}

export default function StatBar({ icon, label, value, max = 100 }: StatBarProps) {
  const pct = Math.min(100, (value / max) * 100);

  return (
    <div className="mb-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <span className="text-sm">{icon}</span>
          {label}
        </span>
        <motion.span
          key={value}
          initial={{ scale: 1.3, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-xs font-mono font-bold ${textColor(value)}`}
        >
          {Math.round(value)}
        </motion.span>
      </div>
      <div className="h-2 bg-navy-900 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${barColor(value)}`}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
