/**
 * FairEstate AI — Main Application
 * 
 * Routes between three views:
 * 1. Landing Page — Hero + features + CTA
 * 2. Analyzer — Property input form
 * 3. Results — Full analysis dashboard
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import PropertyForm from './components/PropertyForm';
import ResultCards from './components/ResultCards';
import DealVerdict from './components/DealVerdict';
import SimilarProperties from './components/SimilarProperties';
import Charts from './components/Charts';
import { predictProperty } from './api/api';
import { ArrowLeft, RotateCcw } from 'lucide-react';

// Page transition animations
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Handle property analysis submission.
   * Sends data to the /predict endpoint and navigates to results.
   */
  const handleAnalyze = async (propertyData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await predictProperty(propertyData);
      setResult(data);
      setCurrentPage('results');
    } catch (err) {
      console.error('Prediction error:', err);
      setError(
        err.response?.data?.detail ||
        'Failed to analyze property. Please ensure the backend server is running on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate between pages.
   */
  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar currentPage={currentPage} onNavigate={navigate} />

      <AnimatePresence mode="wait">
        {/* ── Landing Page ──────────────────────────────────────────────── */}
        {currentPage === 'landing' && (
          <motion.div
            key="landing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <LandingPage onAnalyze={() => navigate('analyzer')} />
          </motion.div>
        )}

        {/* ── Property Analyzer ─────────────────────────────────────────── */}
        {currentPage === 'analyzer' && (
          <motion.div
            key="analyzer"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <PropertyForm onSubmit={handleAnalyze} loading={loading} />

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto px-4 mt-4"
              >
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  ⚠️ {error}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Results Dashboard ─────────────────────────────────────────── */}
        {currentPage === 'results' && result && (
          <motion.div
            key="results"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="pt-24 pb-16 px-4 sm:px-6 lg:px-8"
          >
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="section-heading mb-2">Analysis Results</h1>
                  <p className="text-slate-400">
                    Comprehensive AI-powered property evaluation
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('analyzer')}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    New Analysis
                  </button>
                </div>
              </div>

              {/* Results Layout */}
              <div className="space-y-6">
                {/* Row 1: Result Cards */}
                <ResultCards result={result} />

                {/* Row 2: Deal Verdict */}
                <DealVerdict result={result} />

                {/* Row 3: Similar Properties */}
                <SimilarProperties
                  properties={result.similar_properties}
                  predictedPrice={result.predicted_price}
                />

                {/* Row 4: Charts */}
                <Charts result={result} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
