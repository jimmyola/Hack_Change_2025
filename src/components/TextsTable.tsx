import { useState, useEffect } from 'react';
import { api, TextItem, PaginatedResponse } from '../lib/api';
import { ChevronLeft, ChevronRight, Edit2, Save, X } from 'lucide-react';

export function TextsTable() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    source: '',
    sentiment: '',
    min_confidence: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadTexts();
  }, [page, filters]);

  const loadTexts = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20 };
      if (filters.source) params.source = filters.source;
      if (filters.sentiment) params.sentiment = filters.sentiment;
      if (filters.min_confidence) params.min_confidence = parseFloat(filters.min_confidence);

      const result = await api.getTexts(params);
      setData(result);
    } catch (error) {
      console.error('Failed to load texts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: TextItem) => {
    setEditingId(item.id);
    setEditValue(item.corrected_sentiment || item.predicted_sentiment);
  };

  const handleSave = async (id: string) => {
    try {
      await api.updateText(id, editValue);
      setEditingId(null);
      loadTexts();
    } catch (error) {
      console.error('Failed to update text:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'text-green-600 bg-green-50',
      negative: 'text-red-600 bg-red-50',
      neutral: 'text-gray-600 bg-gray-50',
    };
    return colors[sentiment] || 'text-gray-600 bg-gray-50';
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading texts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Filter by source"
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            value={filters.min_confidence}
            onChange={(e) => setFilters({ ...filters, min_confidence: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.1"
            min="0"
            max="1"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Text
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sentiment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{item.source}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate">
                    {item.text}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {editingId === item.id ? (
                      <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                        <option value="neutral">Neutral</option>
                      </select>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                          item.corrected_sentiment || item.predicted_sentiment
                        )}`}
                      >
                        {item.corrected_sentiment || item.predicted_sentiment}
                        {item.corrected_sentiment && ' (edited)'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {(item.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {editingId === item.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(item.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={handleCancel} className="text-red-600 hover:text-red-800">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.total > 0 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * data.page_size + 1} to{' '}
              {Math.min(page * data.page_size, data.total)} of {data.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.total_pages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
