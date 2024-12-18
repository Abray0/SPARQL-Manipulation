import  { useState } from 'react';
import { Search } from 'lucide-react';

interface QueryEditorProps {
  onExecuteQuery: (query: string) => void;
}

const DEFAULT_QUERY = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://example.org/books/>

SELECT ?title ?author ?genre ?publishedYear ?coverImage
WHERE {
  ?book a :Book ;
        :title ?title ;
        :author ?author ;
        :genre ?genre ;
        :publishedYear ?publishedYear ;
        :coverImage ?coverImage .
}
LIMIT 10`;

export function QueryEditor({ onExecuteQuery }: QueryEditorProps) {
  const [query, setQuery] = useState(DEFAULT_QUERY);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">SPARQL Query</h2>
        <button
          onClick={() => onExecuteQuery(query)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Search size={16} />
          Execute Query
        </button>
      </div>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full h-48 p-4 font-mono text-sm bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Enter your SPARQL query here..."
      />
    </div>
  );
}