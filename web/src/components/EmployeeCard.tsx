import { motion } from 'framer-motion';
import type { Employee } from '../game/types';
import { getMoodEmoji } from '../game/employees';

interface EmployeeCardProps {
  employee: Employee;
  morale: number;
  index: number;
}

export default function EmployeeCard({ employee, morale, index }: EmployeeCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25 }}
      className="bg-navy-800/60 border border-navy-500/30 rounded-lg p-2.5 flex items-center gap-2
                 hover:border-cyan-400/30 transition-colors duration-150 group"
    >
      <span className="text-xl" title={`Morale mood`}>
        {getMoodEmoji(morale)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-200 truncate group-hover:text-white transition-colors">
          {employee.name}
        </p>
        <p className="text-[10px] text-gray-500 truncate">{employee.role}</p>
      </div>
    </motion.div>
  );
}
