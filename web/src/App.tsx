import { useGameLoop } from './hooks/useGameLoop';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';

export default function App() {
  const {
    state,
    handleStart,
    handleLoadSave,
    handleAction,
    handleBuyUpgrade,
    handleBuyDepartment,
    handlePause,
    handleSpeed,
    handleSave,
    handleRestart,
    handleDismissTutorial,
  } = useGameLoop();

  if (state.phase === 'start') {
    return <StartScreen onStart={handleStart} onLoadSave={handleLoadSave} />;
  }

  return (
    <GameScreen
      state={state}
      onAction={handleAction}
      onBuyUpgrade={handleBuyUpgrade}
      onBuyDepartment={handleBuyDepartment}
      onPause={handlePause}
      onSpeed={handleSpeed}
      onSave={handleSave}
      onRestart={handleRestart}
      onDismissTutorial={handleDismissTutorial}
    />
  );
}
