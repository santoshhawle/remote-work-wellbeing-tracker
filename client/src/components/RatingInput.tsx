interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  description?: string;
}

function scoreColor(v: number): string {
  if (v >= 7) return 'bg-emerald-500 text-white ring-emerald-300';
  if (v >= 4) return 'bg-amber-500  text-white ring-amber-300';
  return 'bg-rose-500 text-white ring-rose-300';
}

export default function RatingInput({ label, value, onChange, description }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="label">{label}</span>
        {value > 0 && (
          <span
            className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${scoreColor(value)}`}
          >
            {value}/10
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-400 mb-3">{description}</p>
      )}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-100 focus:outline-none focus:ring-2 ring-offset-1 ${
              value === n
                ? scoreColor(n)
                : 'bg-gray-100 text-gray-600 hover:bg-brand-100 hover:text-brand-700'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
