import { motion } from 'framer-motion';
import type { GameState, UpgradeName, DepartmentName } from '../game/types';
import { STAT_META } from '../game/types';
import { getMarketShareTooltip } from '../game/engine';
import Header from './Header';
import StatBar from './StatBar';
import EmployeeCard from './EmployeeCard';
import NewsFeed from './NewsFeed';
import ActionPanel from './ActionPanel';
import ShopPanel from './ShopPanel';
import EventToast from './EventToast';
import GameOverModal from './GameOverModal';

interface GameScreenProps {
  state: GameState;
  onAction: (id: string) => void;
  onBuyUpgrade: (name: UpgradeName) => void;
  onBuyDepartment: (name: DepartmentName) => void;
  onPause: () => void;
  onSpeed: () => void;
  onSave: () => void;
  onRestart: () => void;
  onDismissTutorial: () => void;
}

export default function GameScreen({
  state,
  onAction,
  onBuyUpgrade,
  onBuyDepartment,
  onPause,
  onSpeed,
  onSave,
  onRestart,
  onDismissTutorial,
}: GameScreenProps) {
  const showTutorial = !state.tutorialSeen;

  return (
    <div className="h-screen flex flex-col bg-navy-950 overflow-hidden">
      <Header state={state} onPause={onPause} onSpeed={onSpeed} onSave={onSave} />

      <EventToast floatingTexts={state.floatingTexts} />

      <div className="flex-1 grid grid-cols-12 gap-3 p-3 min-h-0 overflow-hidden">
        {/* Left column — Stats + News + Rivals */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-3 min-h-0 overflow-y-auto">
          {/* Stats */}
          <div className="glass-panel p-3">
            <h3 className="text-xs font-display font-semibold text-cyan-400 tracking-wider uppercase mb-2 flex items-center gap-2">
              <span>📊</span> Company Health
            </h3>
            {STAT_META.map(({ key, label, icon }) => (
              <StatBar key={key} icon={icon} label={label} value={state.stats[key]} />
            ))}
          </div>

          {/* Rivals */}
          <div className="glass-panel p-3">
            <h3 className="text-xs font-display font-semibold text-cyan-400 tracking-wider uppercase mb-2 flex items-center gap-2">
              <span>🏁</span> Rival Companies
            </h3>
            <div className="space-y-2">
              {state.rivals.map((rival) => (
                <div key={rival.name} className="flex items-center gap-2">
                  <span className="text-sm shrink-0">{rival.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300 truncate">{rival.name}</span>
                      <span className="text-[10px] font-mono text-gray-400">{Math.round(rival.marketShare)}%</span>
                    </div>
                    <div className="h-1 bg-navy-900 rounded-full overflow-hidden mt-0.5">
                      <motion.div
                        className="h-full bg-red-500/70 rounded-full"
                        animate={{ width: `${Math.min(100, rival.marketShare)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {/* Your bar */}
              <div className="flex items-center gap-2 pt-1 border-t border-navy-500/30">
                <span className="text-sm shrink-0">🏢</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cyan-400 font-medium truncate">You</span>
                    <span className="text-[10px] font-mono text-cyan-400">{Math.round(state.marketShare)}%</span>
                  </div>
                  <div className="h-1 bg-navy-900 rounded-full overflow-hidden mt-0.5">
                    <motion.div
                      className="h-full bg-cyan-400 rounded-full"
                      animate={{ width: `${Math.min(100, state.marketShare)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* News */}
          <NewsFeed news={state.news} />
        </div>

        {/* Center — Employees */}
        <div className="col-span-12 lg:col-span-5 flex flex-col min-h-0 overflow-hidden">
          <div className="glass-panel p-3 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-display font-semibold text-cyan-400 tracking-wider uppercase flex items-center gap-2">
                <span>👥</span> Team ({state.employees.length})
              </h3>
              <div className="group relative">
                <span className="text-[10px] text-gray-500 cursor-help border-b border-dashed border-gray-600">
                  📈 Market share tips
                </span>
                <div className="absolute right-0 top-5 z-20 w-56 p-2 bg-navy-800 border border-navy-500/60 rounded-lg
                              text-[10px] text-gray-400 leading-snug opacity-0 pointer-events-none
                              group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 shadow-xl">
                  {getMarketShareTooltip()}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {state.employees.map((emp, i) => (
                  <EmployeeCard
                    key={emp.id}
                    employee={emp}
                    morale={state.stats.morale}
                    index={i}
                  />
                ))}
              </div>
              {state.employees.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  No employees... hire some!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Actions + Shop */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto">
          <ActionPanel state={state} onAction={onAction} />
          <ShopPanel state={state} onBuyUpgrade={onBuyUpgrade} onBuyDepartment={onBuyDepartment} />
        </div>
      </div>

      {/* Tutorial modal */}
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel max-w-lg w-full p-6"
          >
            <h2 className="font-display text-xl font-bold text-cyan-400 mb-4">🎮 How to Play</h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-2">
                <span className="text-cyan-400 shrink-0">•</span>
                Each tick = 1 month. You earn profit = revenue − salaries. Keep stats high so revenue beats payroll.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 shrink-0">•</span>
                Stats slowly decay — spend on actions, upgrades, and departments to keep them up.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400 shrink-0">•</span>
                Strong marketing, reputation, and satisfaction grow your market share toward the win target.
              </li>
              <li className="flex gap-2">
                <span className="text-red-400 shrink-0">•</span>
                Watch out: low morale makes people quit; lawsuits, strikes, and rivals will test you.
              </li>
              <li className="flex gap-2">
                <span className="text-gold-400 shrink-0">•</span>
                You lose if cash, employees, or reputation hit zero.
              </li>
            </ul>
            <button
              onClick={onDismissTutorial}
              className="btn-primary w-full mt-6"
            >
              Let's Go! 🚀
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Game over modal */}
      {(state.phase === 'won' || state.phase === 'lost') && (
        <GameOverModal state={state} onRestart={onRestart} />
      )}
    </div>
  );
}
