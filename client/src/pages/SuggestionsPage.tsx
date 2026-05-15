import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import SuggestionCard from '../components/SuggestionCard';
import { api } from '../api';
import type { Suggestion } from '../types';

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setSuggestions(await api.suggestions.get());
    } catch {
      setError('Failed to load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              Your suggestions
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Personalised based on your recent wellbeing logs
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-5 py-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {suggestions.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No suggestions yet. <Link to="/checkin" className="text-brand-600 hover:underline">Log your wellbeing</Link> to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((s, i) => (
                  <SuggestionCard key={i} s={s} />
                ))}
                <p className="text-xs text-center text-gray-400 pt-2">
                  Suggestions refresh after each new check-in.{' '}
                  <Link to="/checkin" className="text-brand-600 hover:underline">
                    Update today's log →
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
