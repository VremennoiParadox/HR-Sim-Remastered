import { motion } from 'framer-motion';
import type { GameState } from '../game/types';
import { calculateProfit } from '../game/engine';
import { DIFFICULTY_TARGETS } from '../game/types';

interface HeaderProps {
  state: GameState;
  onPause: () => void;
  onSpeed: () => void;
  onSave: () => void;
}

function AnimatedNumber({ value, prefix = '', suffix = '', color }: { value: number; prefix?: string; suffix?: string; color?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.15, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={color}
    >
      {prefix}{value.toLocaleString()}{suffix}
    </motion.span>
  );
}

export default function Header({ state, onPause, onSpeed, onSave }: HeaderProps) {
  const profit = calculateProfit(state);
  const target = DIFFICULTY_TARGETS[state.difficulty];
  const shareProgress = Math.min(100, (state.marketShare / target) * 100);
  const speedLabel = state.speed === 0.5 ? '0.5x' : state.speed === 1 ? '1x' : '2x';

  return (
    <header className="bg-navy-800/90 backdrop-blur border-b border-navy-500/40 px-4 py-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Company info */}
        <div className="min-w-0">
          <h1 className="font-display font-bold text-lg text-white truncate">
            {state.company}
          </h1>
          <p className="text-xs text-gray-400">
            {state.leaderStyle.charAt(0).toUpperCase() + state.leaderStyle.slice(1)} · {state.difficulty}
          </p>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-5 flex-wrap">
          <Metric label="CASH" color="text-gold-400">
            <AnimatedNumber value={state.money} prefix="$" color="text-gold-400" />
          </Metric>
          <Metric label="PROFIT/MO" color={profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            <AnimatedNumber value={profit} prefix="$" color={profit >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          </Metric>
          <Metric label={`SHARE (→${target}%)`} color="text-cyan-400">
            <div className="flex items-center gap-2">
              <AnimatedNumber value={Math.round(state.marketShare)} suffix="%" color="text-cyan-400" />
              <div className="w-16 h-1.5 bg-navy-900 rounded-full overflow-hidden hidden sm:block">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full"
                  animate={{ width: `${shareProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </Metric>
          <Metric label="TEAM" color="text-gray-200">
            <AnimatedNumber value={state.employees.length} color="text-gray-200" />
          </Metric>
          <Metric label="DATE" color="text-gray-200">
            <span className="text-gray-200 font-mono text-sm font-bold">
              Y{state.year} · M{state.month}
            </span>
          </Metric>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={onSpeed} className="btn-action text-xs px-3 py-1.5">
            ⏩ {speedLabel}
          </button>
          <button onClick={onPause} className="btn-action text-xs px-3 py-1.5">
            {state.paused ? '▶ Play' : '⏸ Pause'}
          </button>
          <button onClick={onSave} className="btn-action text-xs px-3 py-1.5" title="Save game">
            💾
          </button>
        </div>
      </div>
    </header>
  );
}

function Metric({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-sm font-bold font-mono ${color}`}>{children}</p>
    </div>
  );
}
