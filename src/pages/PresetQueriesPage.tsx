import { useState } from 'react';
import { presetQueries } from '../utils/presetQueries';
import { QueryResults } from '../components/QueryResults';
import { sparqlEngine } from '../utils/sparqlEngine';

export function PresetQueriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', ...new Set(presetQueries.map(q => q.category))];

  const filteredQueries = selectedCategory === 'All'
    ? presetQueries
    : presetQueries.filter(q => q.category === selectedCategory);

  const handleQueryClick = (query: string) => {
    try {
      const queryResults = sparqlEngine.executeQuery(query);
      setResults(queryResults);
      setError(null);
      console.log(queryResults);
      console.log(query);
    } catch (err) {
      setError('Failed to execute query');
      setResults([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Preset Queries</h2>
        <div className="flex space-x-2 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredQueries.map(query => (
            <div
              key={query.id}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleQueryClick(query.query)}
            >
              <h3 className="font-semibold text-gray-900">{query.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{query.description}</p>
            </div>
          ))}
        </div>
      </div>
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-8">
          {error}
        </div>
      )}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Results</h3>
        <QueryResults results={results} />
      </div>
    </div>
  );
}