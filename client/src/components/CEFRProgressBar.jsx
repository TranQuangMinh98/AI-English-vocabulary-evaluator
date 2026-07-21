const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LEVEL_COLORS = {
  A1: 'bg-red-400',
  A2: 'bg-orange-400',
  B1: 'bg-yellow-400',
  B2: 'bg-lime-400',
  C1: 'bg-green-400',
  C2: 'bg-emerald-500'
};

function CEFRProgressBar({ level, attribute }) {
  const levelIndex = CEFR_LEVELS.indexOf(level);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{attribute}</span>
        <span className="text-lg font-bold text-gray-900">{level}</span>
      </div>

      <div className="flex gap-1">
        {CEFR_LEVELS.map((lvl, index) => {
          const isActive = index <= levelIndex;
          const colorClass = isActive ? LEVEL_COLORS[lvl] : 'bg-gray-200';

          return (
            <div
              key={lvl}
              className={`flex-1 h-3 rounded-sm transition-colors ${colorClass}`}
              title={lvl}
            />
          );
        })}
      </div>
    </div>
  );
}

export default CEFRProgressBar;
