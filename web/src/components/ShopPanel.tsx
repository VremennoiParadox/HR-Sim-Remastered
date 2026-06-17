import type { GameState, UpgradeName, DepartmentName } from '../game/types';
import { UPGRADES, DEPARTMENTS } from '../game/types';

interface ShopPanelProps {
  state: GameState;
  onBuyUpgrade: (name: UpgradeName) => void;
  onBuyDepartment: (name: DepartmentName) => void;
}

export default function ShopPanel({ state, onBuyUpgrade, onBuyDepartment }: ShopPanelProps) {
  return (
    <div className="glass-panel p-3 space-y-3">
      {/* Upgrades */}
      <div>
        <h3 className="text-xs font-display font-semibold text-cyan-400 tracking-wider uppercase mb-2 flex items-center gap-2">
          <span>🛒</span> Upgrades
        </h3>
        <div className="space-y-1.5">
          {(Object.entries(UPGRADES) as [UpgradeName, typeof UPGRADES[UpgradeName]][]).map(([name, info]) => {
            const owned = state.upgrades[name];
            const canAfford = state.money >= info.cost;

            return (
              <button
                key={name}
                onClick={() => onBuyUpgrade(name)}
                disabled={owned || !canAfford || state.paused}
                className={`btn-action w-full text-left flex items-center gap-2.5 ${
                  owned ? '!border-emerald-500/30 !bg-emerald-500/5' : ''
                }`}
              >
                <span className="text-base shrink-0">{info.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium truncate">
                      {owned ? `✓ ${name}` : name}
                    </span>
                    {!owned && (
                      <span className="text-[10px] font-mono text-gold-400 shrink-0">
                        ${info.cost.toLocaleString()}
                      </span>
                    )}
                    {owned && (
                      <span className="text-[10px] text-emerald-400 shrink-0">OWNED</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 truncate">{info.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Departments */}
      <div>
        <h3 className="text-xs font-display font-semibold text-cyan-400 tracking-wider uppercase mb-2 flex items-center gap-2">
          <span>🏢</span> Departments
        </h3>
        <div className="space-y-1.5">
          {(Object.entries(DEPARTMENTS) as [DepartmentName, typeof DEPARTMENTS[DepartmentName]][]).map(([name, info]) => {
            const owned = state.departments[name];
            const canAfford = state.money >= info.cost;

            return (
              <button
                key={name}
                onClick={() => onBuyDepartment(name)}
                disabled={owned || !canAfford || state.paused}
                className={`btn-action w-full text-left flex items-center gap-2.5 ${
                  owned ? '!border-emerald-500/30 !bg-emerald-500/5' : ''
                }`}
              >
                <span className="text-base shrink-0">{info.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium truncate">
                      {owned ? `✓ ${name}` : name}
                    </span>
                    {!owned && (
                      <span className="text-[10px] font-mono text-gold-400 shrink-0">
                        ${info.cost.toLocaleString()}
                      </span>
                    )}
                    {owned && (
                      <span className="text-[10px] text-emerald-400 shrink-0">OPEN</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 truncate">{info.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
