import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import RatingInput from '../components/RatingInput';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { markCheckedInToday } from '../services/notificationStorage';

export default function CheckInPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mood,      setMood]      = useState(0);
  const [energy,    setEnergy]    = useState(0);
  const [focus,     setFocus]     = useState(0);
  const [notes,     setNotes]     = useState('');
  const [workHours, setWorkHours] = useState<number | ''>(8);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState('');

  // Pre-fill from today's existing log
  useEffect(() => {
    api.logs.getToday().then((log) => {
      if (log) {
        setMood(log.mood);
        setEnergy(log.energy);
        setFocus(log.focus);
        setNotes(log.notes ?? '');
        setWorkHours(log.work_hours);
      }
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!mood || !energy || !focus) {
      setError('Please rate all three dimensions before submitting.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.logs.create({
        mood,
        energy,
        focus,
        notes: notes.trim() || undefined,
        work_hours: workHours === '' ? 8 : workHours,
      });
      if (user) markCheckedInToday(user.id);
      setDone(true);
      setTimeout(() => navigate('/suggestions'), 1800);
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to save log');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 gap-4 animate-fade-in">
          <CheckCircle className="w-16 h-16 text-emerald-500" />
          <h2 className="text-xl font-bold text-gray-900">Wellbeing logged!</h2>
          <p className="text-gray-500 text-sm">Redirecting to your suggestions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Daily Check-in</h1>
          <p className="text-gray-500 text-sm mt-1">
            How are you feeling right now?{' '}
            <span className="text-gray-400">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long', month: 'long', day: 'numeric',
              })}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-7">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <RatingInput
            label="😊 Mood"
            description="How are you feeling emotionally? (1 = very low, 10 = excellent)"
            value={mood}
            onChange={setMood}
          />

          <RatingInput
            label="⚡ Energy"
            description="How energised and alert do you feel? (1 = exhausted, 10 = very energised)"
            value={energy}
            onChange={setEnergy}
          />

          <RatingInput
            label="🎯 Focus"
            description="How concentrated and productive do you feel? (1 = very distracted, 10 = laser focused)"
            value={focus}
            onChange={setFocus}
          />

          {/* Work hours */}
          <div>
            <label className="label" htmlFor="workHours">
              Hours worked today
            </label>
            <input
              id="workHours"
              type="number"
              min={0}
              max={24}
              step={0.5}
              className="input w-32"
              value={workHours}
              onChange={(e) =>
                setWorkHours(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label" htmlFor="notes">
              Notes{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              maxLength={1000}
              className="input resize-none"
              placeholder="Anything notable about your day, blockers, wins…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">{notes.length}/1000</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving…' : 'Save check-in'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
