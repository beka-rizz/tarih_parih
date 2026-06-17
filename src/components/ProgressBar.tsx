interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600 sm:text-sm">
        <span>
          {current} / {total}
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 sm:h-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-700 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
