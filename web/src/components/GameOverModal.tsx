import { motion } from 'framer-motion';
import type { GameState } from '../game/types';
import { DIFFICULTY_TARGETS } from '../game/types';

interface GameOverModalProps {
  state: GameState;
  onRestart: () => void;
}

export default function GameOverModal({ state, onRestart }: GameOverModalProps) {
  const isWin = state.phase === 'won';
  const target = DIFFICULTY_TARGETS[state.difficulty];

  const summary = [
    `${state.company} — ${state.difficulty} Mode`,
    `Reached ${Math.round(state.marketShare)}% / ${target}% market share`,
    `Final cash: $${state.money.toLocaleString()}`,
    `Team size: ${state.employees.length}`,
    `Duration: ${state.totalMonths} months (Year ${state.year})`,
    `Leadership: ${state.leaderStyle}`,
  ].join('\n');

  const shareText = isWin
    ? `🏆 I built ${state.company} to ${Math.round(state.marketShare)}% market share in ${state.totalMonths} months on ${state.difficulty} difficulty! #OfficeChaos`
    : `💼 My ${state.company} lasted ${state.totalMonths} months on ${state.difficulty}. ${state.endMessage} #OfficeChaos`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText).catch(() => {});
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="glass-panel max-w-md w-full p-8 text-center"
      >
        <div className="text-6xl mb-4">
          {isWin ? '🏆' : '💀'}
        </div>
        <h2 className={`font-display text-2xl font-bold mb-2 ${isWin ? 'text-gold-400' : 'text-red-400'}`}>
          {isWin ? 'VICTORY!' : 'GAME OVER'}
        </h2>
        <p className="text-gray-300 text-sm mb-6">
          {state.endMessage}
        </p>

        <div className="bg-navy-900/60 rounded-lg p-4 mb-6 text-left">
          <h3 className="text-xs font-display text-cyan-400 uppercase tracking-wider mb-2">Summary</h3>
          <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">{summary}</pre>
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={copyToClipboard} className="btn-action text-xs">
            📋 Copy Result
          </button>
          <button onClick={onRestart} className="btn-primary text-sm">
            🔄 Play Again
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
