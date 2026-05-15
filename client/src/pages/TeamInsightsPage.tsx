import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, LineChart, Line,
} from 'recharts';
import { Users, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import { api } from '../api';
import type { TeamInsights } from '../types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MetricCard({ label, value, color }: { label: string; value: number | null; color: string }) {
  return (
    <div className="card text-center">
      <p className={`text-3xl font-bold ${color}`}>{value ?? '–'}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function TeamInsightsPage() {
  const [data, setData]   = useState<TeamInsights | null>(null);
  const [days, setDays]   = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.team.getInsights(days)
      .then(setData)
      .catch(() => setError('Failed to load team insights.'))
      .finally(() => setLoading(false));
  }, [days]);

  const trendData = (data?.trend ?? []).map((t) => ({
    date: t.date.slice(5),   // MM-DD
    Mood: t.avg_mood,
    Energy: t.avg_energy,
    Focus: t.avg_focus,
  }));

  const dayData = (data?.dayPatterns ?? []).map((d) => ({
    day: DAY_LABELS[d.day_of_week],
    Mood: d.avg_mood,
    Energy: d.avg_energy,
    Focus: d.avg_focus,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-600" /> Team Insights
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Anonymised aggregate data — no individual scores are visible.
            </p>
          </div>
          <select
            className="input w-36 text-sm"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
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

            {/* Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card text-center">
                <p className="text-3xl font-bold text-brand-700">
                  {data.overview.member_count ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Team members</p>
              </div>
              <MetricCard label="Avg mood"   value={data.overview.avg_mood}   color="text-violet-600" />
              <MetricCard label="Avg energy" value={data.overview.avg_energy} color="text-emerald-600" />
              <MetricCard label="Avg focus"  value={data.overview.avg_focus}  color="text-amber-600"  />
            </div>

            {/* Mood distribution */}
            {data.moodDistribution.length > 0 && (
              <div className="card">
                <h2 className="font-semibold text-gray-800 mb-1">Mood distribution</h2>
                <p className="text-xs text-gray-400 mb-4">
                  Low = 1–3 &nbsp;·&nbsp; Medium = 4–6 &nbsp;·&nbsp; High = 7–10
                </p>
                <div className="flex gap-4 flex-wrap">
                  {data.moodDistribution.map(({ mood_level, count }) => {
                    const colours: Record<string, string> = {
                      low: 'bg-rose-100 text-rose-700',
                      medium: 'bg-amber-100 text-amber-700',
                      high: 'bg-emerald-100 text-emerald-700',
                    };
                    return (
                      <div key={mood_level} className={`px-5 py-3 rounded-xl font-medium text-sm ${colours[mood_level]}`}>
                        {mood_level.charAt(0).toUpperCase() + mood_level.slice(1)}: {count} entries
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trend chart */}
            {trendData.length > 1 && (
              <div className="card">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-600" /> Team trend
                </h2>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[1, 10]} ticks={[1,3,5,7,10]} tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="Mood"   stroke="#7c3aed" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Energy" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Focus"  stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Day-of-week patterns */}
            {dayData.length > 0 && (
              <div className="card">
                <h2 className="font-semibold text-gray-800 mb-1">Day-of-week patterns</h2>
                <p className="text-xs text-gray-400 mb-4">
                  Average team scores per day of the week — use this to schedule demanding work thoughtfully.
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dayData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 10]} ticks={[0,2,4,6,8,10]} tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Mood"   fill="#7c3aed" radius={[4,4,0,0]} />
                    <Bar dataKey="Energy" fill="#10b981" radius={[4,4,0,0]} />
                    <Bar dataKey="Focus"  fill="#f59e0b" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
