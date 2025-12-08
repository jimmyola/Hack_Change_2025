import { useEffect, useState } from 'react';
import { api, Statistics } from '../lib/api';
import { BarChart3, TrendingUp, FileText, CheckCircle } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const data = await api.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const sentimentColors: Record<string, string> = {
    positive: 'bg-green-500',
    negative: 'bg-red-500',
    neutral: 'bg-gray-500',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          title="Total Texts"
          value={stats.total_texts.toLocaleString()}
          color="bg-blue-500"
        />
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="Avg Confidence"
          value={`${(stats.avg_confidence * 100).toFixed(1)}%`}
          color="bg-purple-500"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          title="Corrected"
          value={stats.corrected_count.toLocaleString()}
          color="bg-green-500"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Sources"
          value={Object.keys(stats.by_source).length.toLocaleString()}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
          <div className="space-y-4">
            {Object.entries(stats.sentiment_distribution).map(([sentiment, count]) => {
              const percentage = (count / stats.total_texts) * 100;
              return (
                <div key={sentiment}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{sentiment}</span>
                    <span className="text-sm text-gray-600">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${sentimentColors[sentiment] || 'bg-gray-400'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Sources</h3>
          <div className="space-y-3">
            {Object.entries(stats.by_source)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([source, count]) => (
                <div key={source} className="flex justify-between items-center">
                  <span className="text-sm truncate flex-1 mr-4">{source}</span>
                  <span className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}
