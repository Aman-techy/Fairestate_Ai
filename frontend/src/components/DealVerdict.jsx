/**
 * Deal Verdict Component
 * Shows the AI deal verdict with explanation, top factors,
 * and location insight in an eye-catching layout.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, CheckCircle2, Info, Sparkles, MapPin, Lightbulb } from 'lucide-react';

const DealVerdict = ({ result }) => {
  if (!result) return null;

  const {
    status,
    predicted_price,
    price_difference_percent,
    suggestion,
    top_factors,
    location_insight,
    agent_explanations,
  } = result;

  // Status-specific styling
  const verdictConfig = {
    'Underpriced': {
      gradient: 'from-green-500/20 to-green-600/5',
      border: 'border-green-500/30',
      textColor: 'text-green-400',
      icon: <CheckCircle2 className="w-8 h-8 text-green-400" />,
      bg: 'bg-green-500/10',
    },
    'Fairly Priced': {
      gradient: 'from-blue-500/20 to-blue-600/5',
      border: 'border-blue-500/30',
      textColor: 'text-blue-400',
      icon: <Info className="w-8 h-8 text-blue-400" />,
      bg: 'bg-blue-500/10',
    },
    'Overpriced': {
      gradient: 'from-orange-500/20 to-red-600/5',
      border: 'border-orange-500/30',
      textColor: 'text-orange-400',
      icon: <AlertTriangle className="w-8 h-8 text-orange-400" />,
      bg: 'bg-orange-500/10',
    },
  };

  const vc = verdictConfig[status] || verdictConfig['Fairly Priced'];

  return (
    <div className="space-y-6">
      {/* Main Verdict Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`glass-card p-6 sm:p-8 border ${vc.border} relative overflow-hidden`}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${vc.gradient} opacity-50`} />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-xl ${vc.bg}`}>
              {vc.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500 font-medium">AI Deal Verdict</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-bold ${vc.textColor}`}>
                {status}
              </h2>
            </div>
          </div>

          {/* Verdict explanation */}
          <p className="text-slate-300 leading-relaxed mb-6 text-sm sm:text-base">
            {suggestion}
          </p>

          {/* Agent Explanations */}
          <div className="grid sm:grid-cols-2 gap-3">
            {agent_explanations && Object.entries(agent_explanations).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-white/5"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <p className="text-sm text-slate-300">{value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Location Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-6"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <MapPin className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Location Intelligence</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{location_insight}</p>
          </div>
        </div>
      </motion.div>

      {/* Top Factors Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Top Price Factors</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {top_factors && top_factors.map((factor, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {factor}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DealVerdict;
