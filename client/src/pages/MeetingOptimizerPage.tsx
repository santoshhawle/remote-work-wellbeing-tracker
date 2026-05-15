import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, Tooltip,
} from 'recharts';
import { CalendarClock, Clock, Zap, Brain } from 'lucide-react';
import Header from '../components/Header';
import { api } from '../api';
import type { CalendarSuggestion, CalendarResponse } from '../types';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  deep_work: <Brain  className="w-5 h-5 text-brand-600" />,
  meetings:  <CalendarClock className="w-5 h-5 text-emerald-600" />,
  recovery:  <Zap    className="w-5 h-5 text-amber-500" />,
  timing:    <Clock  className="w-5 h-5 text-sky-500"   />,
  breaks:    <Clock  className="w-5 h-5 text-teal-500"  />,
};

const TYPE_COLORS: Record<string, string> = {
  deep_work: 'border-brand-200 bg-brand-50',
  meetings:  'border-emerald-200 bg-emerald-50',
  recovery:  'border-amber-200  bg-amber-50',
  timing:    'border-sky-200    bg-sky-50',
  breaks:    'border-teal-200   bg-teal-50',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function SuggestionCard({ s }: { s: CalendarSuggestion }) {
  const bg   = TYPE_COLORS[s.type]   ?? 'border-gray-200 bg-gray-50';
  const icon = TYPE_ICONS[s.type]    ?? <CalendarClock className="w-5 h-5 text-gray-500" />;

  return (
    <div className={`rounded-2xl border p-5 animate-fade-in ${bg}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm">{s.title}</h3>
            <span className="shrink-0 text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {s.day}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{s.description}</p>
          <p className="text-xs font-medium text-gray-500 mt-2">
            ⏰ {s.timeBlock}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MeetingOptimizerPage() {
  const [data, setData]     = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.calendar.getSuggestions()
      .then(setData)
      .catch(() => setError('Failed to load calendar suggestions.'))
      .finally(() => setLoading(false));
  }, []);

  const radarData = (data?.dayPatterns ?? [])
    .filter((d) => d.day_of_week >= 1 && d.day_of_week <= 5)
    .map((d) => ({
      day:    DAY_LABELS[d.day_of_week],
      Focus:  d.avg_focus,
      Energy: d.avg_energy,
      Mood:   d.avg_mood,
    }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-brand-600" />
            Meeting Time Optimiser
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Personalised schedule recommendations based on your wellbeing patterns.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-5 py-4 text-sm">{error}</div>
        )}

        {!loading && data && (
          <>
            {data.message && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-5 py-4 text-sm">
                {data.message}
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Suggestions list */}
              <div className="lg:col-span-2 space-y-4">
                {data.suggestions.map((s, i) => (
                  <SuggestionCard key={i} s={s} />
                ))}
              </div>

              {/* Radar chart of personal patterns */}
              {radarData.length >= 3 && (
                <div className="card flex flex-col items-center">
                  <h2 className="font-semibold text-gray-800 mb-1 text-sm self-start">
                    Your weekday profile
                  </h2>
                  <p className="text-xs text-gray-400 mb-4 self-start">
                    Focus + energy by day of week
                  </p>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis
                        dataKey="day"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }}
                      />
                      <Radar name="Focus"  dataKey="Focus"  stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} />
                      <Radar name="Energy" dataKey="Energy" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-brand-600 inline-block" />Focus</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Energy</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
