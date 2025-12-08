import { useState } from 'react';
import { api, EvaluationMetrics } from '../lib/api';
import { Download, Play } from 'lucide-react';

export function AnalyticsPage() {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.evaluateModel();
      setMetrics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate model');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await api.exportData('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sentiment_data.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Model Evaluation</h2>
          <div className="flex gap-3">
            <button
              onClick={handleEvaluate}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {loading ? 'Evaluating...' : 'Run Evaluation'}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Macro F1 Score"
                value={(metrics.macro_f1 * 100).toFixed(2)}
                unit="%"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MetricTable title="Precision" data={metrics.precision} />
              <MetricTable title="Recall" data={metrics.recall} />
              <MetricTable title="F1 Score" data={metrics.f1_score} />
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Confusion Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-white"></th>
                      {metrics.labels.map((label) => (
                        <th key={label} className="border p-2 bg-white capitalize">
                          Predicted {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.confusion_matrix.map((row, i) => (
                      <tr key={i}>
                        <th className="border p-2 bg-white capitalize">
                          True {metrics.labels[i]}
                        </th>
                        {row.map((value, j) => (
                          <td
                            key={j}
                            className={`border p-2 text-center ${
                              i === j ? 'bg-green-100 font-semibold' : 'bg-white'
                            }`}
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!metrics && !loading && (
          <div className="text-center py-12 text-gray-500">
            Click "Run Evaluation" to evaluate the model performance
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, unit }: { title: string; value: string; unit?: string }) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
      <p className="text-sm opacity-90 mb-1">{title}</p>
      <p className="text-3xl font-bold">
        {value}
        {unit && <span className="text-xl ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function MetricTable({ title, data }: { title: string; data: Record<string, number> }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-semibold mb-3">{title}</h4>
      <div className="space-y-2">
        {Object.entries(data).map(([label, value]) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-sm capitalize">{label}</span>
            <span className="font-semibold">{(value * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
