import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CompanyType, LeadershipStyle, Difficulty } from '../game/types';
import { COMPANIES, LEADERSHIP } from '../game/types';
import { hasSave } from '../game/storage';

interface StartScreenProps {
  onStart: (company: CompanyType, leader: LeadershipStyle, difficulty: Difficulty) => void;
  onLoadSave: () => void;
}

const DIFFICULTIES: { name: Difficulty; desc: string; icon: string }[] = [
  { name: 'Easy', desc: 'Win at 50% market share, comfy starting cash', icon: '🌤️' },
  { name: 'Normal', desc: 'Win at 70% — a fair fight', icon: '⛅' },
  { name: 'Hard', desc: 'Win at 90%, lean budget, 3 rivals', icon: '⛈️' },
];

export default function StartScreen({ onStart, onLoadSave }: StartScreenProps) {
  const [company, setCompany] = useState<CompanyType | null>(null);
  const [leader, setLeader] = useState<LeadershipStyle>('democratic');
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const canStart = company !== null;
  const savedExists = hasSave();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-3xl w-full"
      >
        {/* Title */}
        <div className="text-center mb-10">
          <motion.h1
            className="font-display text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200 mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            OFFICE CHAOS
          </motion.h1>
          <motion.p
            className="text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Build a company. Beat the market. Don't go broke.
          </motion.p>
          <motion.p
            className="text-navy-500 text-xs mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            by Jeffrey · ideas from Danila, Audrey & Lyra
          </motion.p>
        </div>

        {/* Company picker */}
        <Section title="Choose Your Company" delay={0.3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.entries(COMPANIES) as [CompanyType, typeof COMPANIES[CompanyType]][]).map(([name, info]) => (
              <motion.button
                key={name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCompany(name)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                  company === name
                    ? 'bg-cyan-500/10 border-cyan-400/60 shadow-lg shadow-cyan-400/10'
                    : 'bg-navy-800/60 border-navy-500/30 hover:border-navy-500/60'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{info.icon}</span>
                  <span className="font-display font-semibold text-white text-sm">{name}</span>
                </div>
                <p className="text-xs text-gray-400 ml-10">{info.desc}</p>
                <p className="text-[10px] text-cyan-400/70 ml-10 mt-0.5">{info.bonus}</p>
              </motion.button>
            ))}
          </div>
        </Section>

        {/* Leadership style */}
        <Section title="Leadership Style" delay={0.4}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.entries(LEADERSHIP) as [LeadershipStyle, typeof LEADERSHIP[LeadershipStyle]][]).map(([style, info]) => (
              <motion.button
                key={style}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLeader(style)}
                className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                  leader === style
                    ? 'bg-cyan-500/10 border-cyan-400/60'
                    : 'bg-navy-800/60 border-navy-500/30 hover:border-navy-500/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-lg">{info.icon}</span>
                  <span className="font-medium text-white text-sm capitalize">{style}</span>
                </div>
                <p className="text-[11px] text-gray-400 ml-7">{info.desc}</p>
              </motion.button>
            ))}
          </div>
        </Section>

        {/* Difficulty */}
        <Section title="Difficulty" delay={0.5}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DIFFICULTIES.map((d) => (
              <motion.button
                key={d.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDifficulty(d.name)}
                className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                  difficulty === d.name
                    ? 'bg-cyan-500/10 border-cyan-400/60'
                    : 'bg-navy-800/60 border-navy-500/30 hover:border-navy-500/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-lg">{d.icon}</span>
                  <span className="font-medium text-white text-sm">{d.name}</span>
                </div>
                <p className="text-[11px] text-gray-400 ml-7">{d.desc}</p>
              </motion.button>
            ))}
          </div>
        </Section>

        {/* Start button */}
        <motion.div
          className="text-center mt-8 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <AnimatePresence>
            {canStart && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => onStart(company!, leader, difficulty)}
                className="btn-primary text-lg px-10"
              >
                🚀 Start Your Empire
              </motion.button>
            )}
          </AnimatePresence>
          {savedExists && (
            <div>
              <button
                onClick={onLoadSave}
                className="btn-action text-xs"
              >
                📂 Load Saved Game
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

function Section({ title, delay, children }: { title: string; delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      className="mb-5"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <h2 className="font-display text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-6 h-px bg-cyan-400/30" />
        {title}
      </h2>
      {children}
    </motion.div>
  );
}
