import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export function UploadPage() {
  const [datasetFile, setDatasetFile] = useState<File | null>(null);
  const [validationFile, setValidationFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDatasetUpload = async () => {
    if (!datasetFile) return;

    setUploading(true);
    setMessage(null);

    try {
      const result = await api.uploadDataset(datasetFile);
      setMessage({
        type: 'success',
        text: `Successfully uploaded ${result.records_processed} records`,
      });
      setDatasetFile(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to upload dataset',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleValidationUpload = async () => {
    if (!validationFile) return;

    setUploading(true);
    setMessage(null);

    try {
      const result = await api.uploadValidation(validationFile);
      setMessage({
        type: 'success',
        text: `Successfully uploaded ${result.records_processed} validation records`,
      });
      setValidationFile(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to upload validation dataset',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Upload Data</h2>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Dataset Upload</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Upload a CSV file with columns: <code className="bg-gray-100 px-2 py-1 rounded">source</code>,{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">text</code>
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setDatasetFile(e.target.files?.[0] || null)}
                className="hidden"
                id="dataset-upload"
              />
              <label
                htmlFor="dataset-upload"
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
              >
                Choose File
              </label>
              {datasetFile && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{datasetFile.name}</span>
                  <button
                    onClick={handleDatasetUpload}
                    disabled={uploading}
                    className="ml-4 bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Validation Dataset Upload</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Upload a CSV file with columns: <code className="bg-gray-100 px-2 py-1 rounded">text</code>,{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">sentiment</code>
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setValidationFile(e.target.files?.[0] || null)}
                className="hidden"
                id="validation-upload"
              />
              <label
                htmlFor="validation-upload"
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
              >
                Choose File
              </label>
              {validationFile && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{validationFile.name}</span>
                  <button
                    onClick={handleValidationUpload}
                    disabled={uploading}
                    className="ml-4 bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
