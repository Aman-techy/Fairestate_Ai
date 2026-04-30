/**
 * Charts Component
 * Displays data visualizations using Recharts:
 * 1. Feature Importance (horizontal bar chart)
 * 2. Actual vs Predicted (scatter chart)
 * 3. Price Distribution (area chart)
 * 4. Model Comparison (bar chart)
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, AreaChart, Area, Cell, Legend
} from 'recharts';
import { BarChart3, TrendingUp, PieChart, Layers } from 'lucide-react';
import { getMetrics, getFeatureImportance } from '../api/api';

// Custom tooltip for dark theme
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-700/95 backdrop-blur-xl border border-white/10 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white font-medium">
          {p.name}: <span style={{ color: p.color }}>{typeof p.value === 'number' ? p.value.toFixed(4) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const Charts = ({ result }) => {
  const [metrics, setMetrics] = useState(null);
  const [featureImp, setFeatureImp] = useState(null);
  const [activeChart, setActiveChart] = useState('importance');

  // Fetch metrics and feature importance on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, importanceData] = await Promise.all([
          getMetrics(),
          getFeatureImportance(),
        ]);
        setMetrics(metricsData);
        setFeatureImp(importanceData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };
    fetchData();
  }, []);

  // ── Chart 1: Feature Importance ──
  const importanceData = featureImp?.feature_importance?.map(f => ({
    name: f.display_name.length > 20 ? f.display_name.substring(0, 18) + '...' : f.display_name,
    fullName: f.display_name,
    importance: f.importance,
  })) || [];

  // ── Chart 2: Actual vs Predicted ──
  const actualVsPredicted = metrics?.actual_vs_predicted;
  const scatterData = actualVsPredicted
    ? actualVsPredicted.actual.map((a, i) => ({
        actual: parseFloat(a.toFixed(1)),
        predicted: parseFloat(actualVsPredicted.predicted[i].toFixed(1)),
      }))
    : [];

  // ── Chart 3: Model Comparison ──
  const modelCompData = metrics?.model_comparison
    ? Object.entries(metrics.model_comparison).map(([name, m]) => ({
        name: name,
        MAE: m.mae,
        RMSE: m.rmse,
        'R²': m.r2,
      }))
    : [];

  // Chart tabs
  const tabs = [
    { id: 'importance', label: 'Feature Importance', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'scatter', label: 'Actual vs Predicted', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'models', label: 'Model Comparison', icon: <Layers className="w-4 h-4" /> },
  ];

  // Bar colors for feature importance (gradient feel)
  const importanceColors = [
    '#10B981', '#14B88A', '#34D399', '#6EE7B7', '#A7F3D0',
    '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE',
    '#8B5CF6', '#A78BFA',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
      className="glass-card p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <PieChart className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Analytics & Insights</h3>
          <p className="text-sm text-slate-500">
            {metrics ? `Best model: ${metrics.best_model} (R² = ${metrics.best_r2})` : 'Loading...'}
          </p>
        </div>
      </div>

      {/* Chart Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
              ${activeChart === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="h-80 w-full">
        {/* Feature Importance */}
        {activeChart === 'importance' && importanceData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={importanceData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} width={150} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="importance" radius={[0, 6, 6, 0]} name="Importance">
                {importanceData.map((_, index) => (
                  <Cell key={index} fill={importanceColors[index % importanceColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Actual vs Predicted Scatter */}
        {activeChart === 'scatter' && scatterData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ bottom: 10, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number"
                dataKey="actual"
                name="Actual Price"
                tick={{ fill: '#64748B', fontSize: 12 }}
                label={{ value: 'Actual Price', position: 'insideBottom', offset: -5, fill: '#64748B' }}
              />
              <YAxis
                type="number"
                dataKey="predicted"
                name="Predicted Price"
                tick={{ fill: '#64748B', fontSize: 12 }}
                label={{ value: 'Predicted', angle: -90, position: 'insideLeft', fill: '#64748B' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                data={scatterData}
                fill="#10B981"
                fillOpacity={0.6}
                r={4}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}

        {/* Model Comparison */}
        {activeChart === 'models' && modelCompData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelCompData} margin={{ bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />
              <Bar dataKey="MAE" fill="#F97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="RMSE" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="R²" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Loading state */}
        {!metrics && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Loading chart data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Model Stats Footer */}
      {metrics && (
        <div className="mt-6 grid grid-cols-3 gap-4 p-4 rounded-xl bg-white/5">
          <div className="text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">MAE</div>
            <div className="text-lg font-bold text-white">{metrics.best_mae?.toFixed(2)}</div>
          </div>
          <div className="text-center border-x border-white/10">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">RMSE</div>
            <div className="text-lg font-bold text-white">{metrics.best_rmse?.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">R² Score</div>
            <div className="text-lg font-bold text-emerald-400">{metrics.best_r2?.toFixed(4)}</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Charts;
