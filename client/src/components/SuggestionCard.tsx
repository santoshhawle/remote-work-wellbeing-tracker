import type { Suggestion } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  'mental-health': 'bg-rose-50   border-rose-200',
  social:          'bg-sky-50    border-sky-200',
  mindfulness:     'bg-violet-50 border-violet-200',
  exercise:        'bg-emerald-50 border-emerald-200',
  productivity:    'bg-indigo-50 border-indigo-200',
  health:          'bg-teal-50   border-teal-200',
  balance:         'bg-orange-50 border-orange-200',
  environment:     'bg-lime-50   border-lime-200',
  onboarding:      'bg-brand-50  border-brand-200',
};

export default function SuggestionCard({ s }: { s: Suggestion }) {
  const bg = CATEGORY_COLORS[s.category] ?? 'bg-gray-50 border-gray-200';

  return (
    <div className={`rounded-2xl border p-5 animate-fade-in ${bg}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label={s.category}>
            {s.icon}
          </span>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">
            {s.title}
          </h3>
        </div>
        <span className={`badge-${s.priority} shrink-0`}>
          {s.priority}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
    </div>
  );
}
