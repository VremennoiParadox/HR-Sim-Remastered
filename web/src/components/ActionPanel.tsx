import type { GameState, ActionDef } from '../game/types';
import { ACTIONS } from '../game/types';
import { getSpecialAbilityInfo } from '../game/engine';

interface ActionPanelProps {
  state: GameState;
  onAction: (id: string) => void;
}

export default function ActionPanel({ state, onAction }: ActionPanelProps) {
  const specialInfo = getSpecialAbilityInfo(state.leaderStyle);

  return (
    <div className="glass-panel p-3">
      <h3 className="text-xs font-display font-semibold text-cyan-400 tracking-wider uppercase mb-2 flex items-center gap-2">
        <span>⚡</span> Actions
      </h3>
      <div className="space-y-1.5">
        {ACTIONS.map((action) => {
          const isSpecial = action.id === 'special';
          const isLeadership = action.id === 'leadership';
          const cost = isSpecial ? specialInfo.cost : action.cost;
          const desc = isSpecial ? specialInfo.desc : action.desc;
          const label = isSpecial ? specialInfo.label : action.label;
          const canAfford = cost === 0 || state.money >= cost;
          const disabled = !canAfford || state.paused;

          return (
            <ActionButton
              key={action.id}
              action={{ ...action, label, cost, desc }}
              disabled={disabled}
              isLeadership={isLeadership}
              onClick={() => onAction(action.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ActionButton({
  action,
  disabled,
  isLeadership,
  onClick,
}: {
  action: ActionDef;
  disabled: boolean;
  isLeadership: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn-action w-full text-left flex items-center gap-2.5 group"
    >
      <span className="text-base shrink-0">{action.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium truncate">{action.label}</span>
          {action.cost > 0 && !isLeadership && (
            <span className="text-[10px] font-mono text-gold-400 shrink-0">
              ${action.cost.toLocaleString()}
            </span>
          )}
          {action.cost === 0 && !isLeadership && (
            <span className="text-[10px] font-mono text-emerald-400 shrink-0">FREE</span>
          )}
        </div>
        <p className="text-[10px] text-gray-500 truncate">{action.desc}</p>
      </div>
    </button>
  );
}
