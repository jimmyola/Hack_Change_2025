import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { UploadPage } from './components/UploadPage';
import { TextsTable } from './components/TextsTable';
import { AnalyticsPage } from './components/AnalyticsPage';
import { SearchPage } from './components/SearchPage';
import { BarChart3, Upload, FileText, Search, TrendingUp } from 'lucide-react';

type Page = 'dashboard' | 'upload' | 'texts' | 'analytics' | 'search';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navigation = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: BarChart3 },
    { id: 'upload' as Page, label: 'Upload', icon: Upload },
    { id: 'texts' as Page, label: 'Texts', icon: FileText },
    { id: 'analytics' as Page, label: 'Analytics', icon: TrendingUp },
    { id: 'search' as Page, label: 'Search', icon: Search },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'upload':
        return <UploadPage />;
      case 'texts':
        return <TextsTable />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'search':
        return <SearchPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Sentiment Analysis</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        currentPage === item.id
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{renderPage()}</div>
      </main>
    </div>
  );
}

export default App;
