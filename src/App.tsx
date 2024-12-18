import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { PresetQueriesPage } from './pages/PresetQueriesPage';
import { AdvancedQueryPage } from './pages/AdvancedQueryPage';
import { sparqlEngine } from './utils/sparqlEngine';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStore = async () => {
      try {
        await sparqlEngine.loadData();
        setLoading(false);
      } catch (err) {
        setError('Failed to load RDF data');
        setLoading(false);
      }
    };

    initializeStore();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading RDF data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<PresetQueriesPage />} />
          <Route path="/advanced" element={<AdvancedQueryPage />} />
        </Routes>
      </div>
    </Router>
  );
}