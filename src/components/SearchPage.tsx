import { useState } from 'react';
import { api, PaginatedResponse } from '../lib/api';
import { Search, Filter } from 'lucide-react';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    sources: [] as string[],
    sentiment: '',
    minConfidence: '',
  });
  const [results, setResults] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params: any = {
        query: query || undefined,
        sentiment: filters.sentiment || undefined,
        min_confidence: filters.minConfidence ? parseFloat(filters.minConfidence) : undefined,
        page: 1,
        page_size: 20,
      };

      if (filters.sources.length > 0) {
        params.sources = filters.sources;
      }

      const data = await api.searchTexts(params);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'text-green-600 bg-green-50',
      negative: 'text-red-600 bg-red-50',
      neutral: 'text-gray-600 bg-gray-50',
    };
    return colors[sentiment] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Search Texts</h2>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search in text content..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filters.sentiment}
              onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>

            <input
              type="number"
              placeholder="Min confidence (0-1)"
              value={filters.minConfidence}
              onChange={(e) => setFilters({ ...filters, minConfidence: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
              min="0"
              max="1"
            />
          </div>
        </div>
      </div>

      {results && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Search Results ({results.total} found)
          </h3>

          <div className="space-y-4">
            {results.items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500">{item.source}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                      item.corrected_sentiment || item.predicted_sentiment
                    )}`}
                  >
                    {item.corrected_sentiment || item.predicted_sentiment}
                  </span>
                </div>
                <p className="text-gray-800 mb-2">{item.text}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Confidence: {(item.confidence * 100).toFixed(1)}%</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {results.items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No results found. Try different search criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
