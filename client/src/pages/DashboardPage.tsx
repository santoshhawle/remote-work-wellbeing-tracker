import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardEdit, TrendingUp, Flame, Zap, Brain } from 'lucide-react';
import Header from '../components/Header';
import WellbeingChart from '../components/WellbeingChart';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { WellbeingLog } from '../types';

function scoreColor(v: number | null) {
  if (v === null) return 'text-gray-400';
  if (v >= 7) return 'text-emerald-600';
  if (v >= 4) return 'text-amber-600';
  return 'text-rose-600';
}

function scoreBg(v: number | null) {
  if (v === null) return 'bg-gray-100';
  if (v >= 7) return 'bg-emerald-50';
  if (v >= 4) return 'bg-amber-50';
  return 'bg-rose-50';
}

function avg(logs: WellbeingLog[], key: keyof WellbeingLog): number | null {
  if (!logs.length) return null;
  return Math.round((logs.reduce((s, l) => s + (l[key] as number), 0) / logs.length) * 10) / 10;
}

function calcStreak(logs: WellbeingLog[]): number {
  if (!logs.length) return 0;
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  let expected = today;
  for (const log of logs) {
    if (log.date === expected) {
      streak++;
      const d = new Date(expected + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split('T')[0];
    } else {
      break;
    }
  }
  return streak;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [todayLog, setTodayLog]   = useState<WellbeingLog | null>(null);
  const [logs7, setLogs7]         = useState<WellbeingLog[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [today, recent] = await Promise.all([
          api.logs.getToday(),
          api.logs.getAll(30),
        ]);
        setTodayLog(today);
        setLogs7(recent.slice(0, 7));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const streak  = calcStreak(logs7.length ? logs7 : todayLog ? [todayLog] : []);
  const avgMood   = avg(logs7, 'mood');
  const avgEnergy = avg(logs7, 'energy');
  const avgFocus  = avg(logs7, 'focus');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">{dateStr}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Today's check-in */}
            {todayLog ? (
              <div className="card border-l-4 border-l-emerald-400">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                      ✓ Checked in today
                    </p>
                    <p className="text-sm text-gray-500">
                      Logged at{' '}
                      {new Date(todayLog.created_at).toLocaleTimeString('en-GB', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    {[
                      { label: '😊 Mood',   val: todayLog.mood   },
                      { label: '⚡ Energy', val: todayLog.energy },
                      { label: '🎯 Focus',  val: todayLog.focus  },
                    ].map(({ label, val }) => (
                      <div key={label} className="text-center">
                        <p className={`text-2xl font-bold ${scoreColor(val)}`}>{val}</p>
                        <p className="text-xs text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>
                  <Link to="/checkin" className="btn-secondary text-sm">
                    Update log
                  </Link>
                </div>
                {todayLog.notes && (
                  <p className="mt-3 text-sm text-gray-600 italic border-t pt-3">
                    "{todayLog.notes}"
                  </p>
                )}
              </div>
            ) : (
              <div className="card border-2 border-dashed border-brand-200 text-center py-10">
                <ClipboardEdit className="w-10 h-10 text-brand-400 mx-auto mb-3" />
                <h2 className="font-semibold text-gray-800 mb-1">
                  You haven't checked in today
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  It only takes 30 seconds to log your wellbeing.
                </p>
                <Link to="/checkin" className="btn-primary inline-flex">
                  Log today's wellbeing
                </Link>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Day streak',      val: streak,     icon: Flame,  unit: ' days' },
                { label: '7-day avg mood',  val: avgMood,    icon: Brain,  unit: '/10'  },
                { label: '7-day avg energy',val: avgEnergy,  icon: Zap,    unit: '/10'  },
                { label: '7-day avg focus', val: avgFocus,   icon: TrendingUp, unit: '/10' },
              ].map(({ label, val, icon: Icon, unit }) => (
                <div key={label} className={`card py-4 text-center ${scoreBg(typeof val === 'number' ? val : null)}`}>
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${scoreColor(typeof val === 'number' ? val : null)}`} />
                  <p className={`text-2xl font-bold ${scoreColor(typeof val === 'number' ? val : null)}`}>
                    {val ?? '–'}
                    <span className="text-sm font-normal text-gray-400">{val !== null ? unit : ''}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            {logs7.length > 1 && (
              <div className="card">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-600" /> Recent trend
                </h2>
                <WellbeingChart logs={logs7} />
              </div>
            )}

            {logs7.length === 0 && !todayLog && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No data yet. Start by logging today's wellbeing!
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
