import { useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '../api';

type RangePreset = '7' | '30' | '90' | 'custom';

interface CustomRange {
  start: string;
  end: string;
}

export default function ExportControls() {
  const [preset, setPreset] = useState<RangePreset>('30');
  const [custom, setCustom] = useState<CustomRange>({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setError(null);
    setLoading(true);
    try {
      if (preset === 'custom') {
        if (!custom.start || !custom.end) {
          setError('Please select both a start and end date.');
          return;
        }
        await api.logs.exportCsv({ start: custom.start, end: custom.end });
      } else {
        await api.logs.exportCsv({ days: parseInt(preset, 10) });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Export failed — please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Export Logs</h2>

      <div className="flex flex-wrap items-end gap-3">
        {/* Date range selector */}
        <div>
          <label htmlFor="export-range" className="block text-sm font-medium text-gray-700 mb-1">
            Date range
          </label>
          <select
            id="export-range"
            value={preset}
            onChange={(e) => setPreset(e.target.value as RangePreset)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>
        </div>

        {/* Custom date inputs — visible only when "Custom" is selected */}
        {preset === 'custom' && (
          <>
            <div>
              <label htmlFor="export-start" className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                id="export-start"
                type="date"
                value={custom.start}
                onChange={(e) => setCustom((c) => ({ ...c, start: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label htmlFor="export-end" className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                id="export-end"
                type="date"
                value={custom.end}
                onChange={(e) => setCustom((c) => ({ ...c, end: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </>
        )}

        {/* Export button */}
        <button
          type="button"
          onClick={handleExport}
          disabled={loading}
          aria-label="Export wellbeing logs as CSV"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          {loading ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Inline error message */}
      {error !== null && (
        <p role="alert" className="mt-3 text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
