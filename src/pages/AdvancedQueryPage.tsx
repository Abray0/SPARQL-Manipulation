// AdvancedQueryPage.tsx

import  { useEffect, useState } from 'react';
import { QueryEditor } from '../components/QueryEditor';
import { QueryResults } from '../components/QueryResults';
import { sparqlEngine } from '../utils/sparqlEngine';


export function AdvancedQueryPage() {
  const [results, setResults] = useState<any[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);

 
  useEffect(() => {
    const load = async () => {
      try {
        await sparqlEngine.loadData();
        setLoading(false);
      } catch (err) {
        console.error('Data loading error:', err);
        setError('Failed to load data.');
        setLoading(false);
      }
    };

    load();
  }, []);

  
  const handleExecuteQuery = (query: string) => {
    try {
      const queryResults = sparqlEngine.executeQuery(query);
      console.log('Executed Query:', query);
      console.log('Query Results:', queryResults);
      setResults(queryResults);
      setError(null);
    } catch (err) {
      console.error('Query execution error:', err);
      setError('Failed to execute query. Ensure your query is valid SPARQL and includes the necessary prefixes.');
      setResults([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Loading data...</span>
          </div>
        ) : (
          <>
            <QueryEditor onExecuteQuery={handleExecuteQuery} />

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md">
                {error}
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Results</h2>
              <QueryResults results={results} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
