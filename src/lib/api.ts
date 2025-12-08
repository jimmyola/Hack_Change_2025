const API_BASE_URL = 'http://localhost:8000/api';

export interface TextItem {
  id: string;
  source: string;
  text: string;
  predicted_sentiment: string;
  corrected_sentiment?: string;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse {
  items: TextItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Statistics {
  total_texts: number;
  sentiment_distribution: Record<string, number>;
  avg_confidence: number;
  corrected_count: number;
  by_source: Record<string, number>;
}

export interface EvaluationMetrics {
  macro_f1: number;
  precision: Record<string, number>;
  recall: Record<string, number>;
  f1_score: Record<string, number>;
  confusion_matrix: number[][];
  labels: string[];
}

export const api = {
  async uploadDataset(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload-dataset`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload dataset');
    }

    return response.json();
  },

  async uploadValidation(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload-validation`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload validation dataset');
    }

    return response.json();
  },

  async getTexts(params: {
    page?: number;
    page_size?: number;
    source?: string;
    sentiment?: string;
    min_confidence?: number;
  }): Promise<PaginatedResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.source) queryParams.append('source', params.source);
    if (params.sentiment) queryParams.append('sentiment', params.sentiment);
    if (params.min_confidence !== undefined) {
      queryParams.append('min_confidence', params.min_confidence.toString());
    }

    const response = await fetch(`${API_BASE_URL}/texts?${queryParams}`);

    if (!response.ok) {
      throw new Error('Failed to fetch texts');
    }

    return response.json();
  },

  async updateText(id: string, correctedSentiment: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/texts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ corrected_sentiment: correctedSentiment }),
    });

    if (!response.ok) {
      throw new Error('Failed to update text');
    }

    return response.json();
  },

  async getStatistics(): Promise<Statistics> {
    const response = await fetch(`${API_BASE_URL}/statistics`);

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return response.json();
  },

  async evaluateModel(): Promise<EvaluationMetrics> {
    const response = await fetch(`${API_BASE_URL}/evaluate`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to evaluate model');
    }

    return response.json();
  },

  async searchTexts(params: {
    query?: string;
    sources?: string[];
    sentiment?: string;
    min_confidence?: number;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse> {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to search texts');
    }

    return response.json();
  },

  async exportData(format: string = 'csv'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/export?format=${format}`);

    if (!response.ok) {
      throw new Error('Failed to export data');
    }

    return response.blob();
  },
};
