import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import { useNotificationContext } from '../contexts/NotificationContext';
import { requestPermission, isSupported } from '../services/notificationService';

// ─── Time validation ──────────────────────────────────────────────────────────

function isValidTime(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { settings, updateSettings } = useNotificationContext();
  const supported = isSupported();

  const [enabled, setEnabled] = useState(settings.enabled);
  const [time, setTime] = useState(settings.time);
  const [timeError, setTimeError] = useState('');
  const [permError, setPermError] = useState('');
  const [saved, setSaved] = useState(false);

  // Sync local state when context settings change (e.g. after auth rehydration)
  useEffect(() => {
    setEnabled(settings.enabled);
    setTime(settings.time);
  }, [settings.enabled, settings.time]);

  async function handleToggle() {
    if (!supported) return;

    if (!enabled) {
      // Opt in — request permission first (FR-4)
      const permission = await requestPermission();
      if (permission !== 'granted') {
        setPermError(
          'Notification permission was denied. Please allow notifications in your browser settings.',
        );
        return;
      }
      setPermError('');
      setEnabled(true);
      setSaved(false);
      updateSettings({ enabled: true, time });
    } else {
      // Opt out — persist immediately so scheduler stops without needing Save
      setEnabled(false);
      setPermError('');
      setSaved(false);
      updateSettings({ enabled: false, time });
    }
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTime(e.target.value);
    setTimeError('');
    setSaved(false);
  }

  function handleSave() {
    if (!isValidTime(time)) {
      setTimeError('Please enter a valid time in HH:MM format.');
      return;
    }
    updateSettings({ enabled, time });
    setSaved(true);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-sm text-gray-500 mb-8">
          Manage your daily check-in reminder preferences.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">

          {/* Unsupported browser message (M-1) */}
          {!supported && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Browser notifications are not supported in this browser.</span>
            </div>
          )}

          {/* Permission error */}
          {permError && (
            <div
              role="alert"
              className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{permError}</span>
            </div>
          )}

          {/* Opt-in toggle (FR-1) */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              {enabled ? (
                <Bell className="w-5 h-5 text-brand-600 mt-0.5" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">Daily reminder</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Receive a browser notification when it's time to check in.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label="Toggle daily reminder"
              disabled={!supported}
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                ${enabled ? 'bg-brand-600' : 'bg-gray-200'}
                ${!supported ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                  ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {/* Time picker (FR-2) */}
          <div>
            <label
              htmlFor="reminder-time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <Clock className="inline w-4 h-4 mr-1 text-gray-400" />
              Reminder time
            </label>
            <input
              id="reminder-time"
              type="time"
              value={time}
              onChange={handleTimeChange}
              disabled={!supported}
              className={`w-full sm:w-48 px-3 py-2 text-sm border rounded-lg shadow-sm
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                ${timeError ? 'border-rose-400' : 'border-gray-300'}
                ${!supported ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'bg-white'}`}
            />
            {timeError && (
              <p role="alert" className="mt-1 text-xs text-rose-600">
                {timeError}
              </p>
            )}
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSave}
              disabled={!supported}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                ${supported
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              Save preferences
            </button>

            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                Saved
              </span>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
