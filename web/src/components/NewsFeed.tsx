import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NewsItem } from '../game/types';

interface NewsFeedProps {
  news: NewsItem[];
}

const toneColor: Record<string, string> = {
  good: 'text-emerald-400',
  bad: 'text-red-400',
  warn: 'text-amber-400',
  muted: 'text-gray-400',
};

const toneDot: Record<string, string> = {
  good: 'bg-emerald-400',
  bad: 'bg-red-400',
  warn: 'bg-amber-400',
  muted: 'bg-gray-500',
};

export default function NewsFeed({ news }: NewsFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [news.length]);

  const reversed = [...news].reverse();

  return (
    <div className="glass-panel p-3 flex-1 min-h-0 flex flex-col">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-navy-500/40">
        <span className="text-sm">📰</span>
        <h3 className="text-xs font-display font-semibold text-cyan-400 tracking-wider uppercase">
          The Daily Dispatch
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-1">
        <AnimatePresence initial={false}>
          {reversed.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 py-1"
            >
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${toneDot[item.tone]}`} />
              <div className="min-w-0">
                <span className="text-[10px] text-gray-500 font-mono">{item.date}</span>
                <p className={`text-xs leading-snug ${toneColor[item.tone]}`}>
                  {item.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
