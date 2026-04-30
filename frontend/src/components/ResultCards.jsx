/**
 * Result Cards Component
 * Displays the main prediction results in a grid of animated glassmorphism cards.
 * Shows: Predicted Price, Fair Range, Deal Score, Negotiation Gap.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, AlertTriangle, DollarSign, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

/**
 * Animated counter that counts up from 0 to the target value.
 */
const AnimatedNumber = ({ value, duration = 1.5, decimals = 1, prefix = '', suffix = '' }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    const increment = end / (duration * 60); // ~60fps
    let frame;

    const animate = () => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        return;
      }
      setDisplay(start);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span>{prefix}{display.toFixed(decimals)}{suffix}</span>
  );
};

/**
 * Circular deal score gauge with animated SVG ring.
 */
const DealScoreGauge = ({ score }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Color based on score
  const getColor = () => {
    if (score >= 80) return '#22C55E'; // Green
    if (score >= 60) return '#3B82F6'; // Blue
    if (score >= 40) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  const getLabel = () => {
    if (score >= 85) return 'Excellent Deal';
    if (score >= 70) return 'Good Deal';
    if (score >= 55) return 'Fair Deal';
    if (score >= 40) return 'Below Average';
    return 'Poor Deal';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="score-ring w-full h-full" viewBox="0 0 140 140">
          {/* Background ring */}
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="10"
          />
          {/* Score ring */}
          <motion.circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: getColor() }}>
            <AnimatedNumber value={score} decimals={0} />
          </span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>
      <span className="text-sm font-medium mt-2" style={{ color: getColor() }}>
        {getLabel()}
      </span>
    </div>
  );
};


const ResultCards = ({ result }) => {
  if (!result) return null;

  const {
    predicted_price,
    fair_range,
    status,
    deal_score,
    negotiation_gap,
    price_difference_percent,
  } = result;

  // Status styling
  const statusConfig = {
    'Underpriced': {
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      glow: 'glow-emerald',
      icon: <ArrowDownRight className="w-5 h-5" />,
      label: '🟢 Underpriced',
    },
    'Fairly Priced': {
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      glow: 'glow-blue',
      icon: <Minus className="w-5 h-5" />,
      label: '🔵 Fairly Priced',
    },
    'Overpriced': {
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      glow: 'glow-red',
      icon: <ArrowUpRight className="w-5 h-5" />,
      label: '🟠 Overpriced',
    },
  };

  const sc = statusConfig[status] || statusConfig['Fairly Priced'];

  const cards = [
    {
      title: 'AI Predicted Price',
      value: <AnimatedNumber value={predicted_price} prefix="" suffix="" />,
      subtitle: 'Per unit area',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      accent: 'emerald',
    },
    {
      title: 'Fair Price Range',
      value: `${fair_range.lower.toFixed(1)} – ${fair_range.upper.toFixed(1)}`,
      subtitle: '±5% of predicted value',
      icon: <Target className="w-5 h-5 text-blue-400" />,
      accent: 'blue',
    },
    {
      title: 'Deal Status',
      value: sc.label,
      subtitle: `${price_difference_percent >= 0 ? '+' : ''}${price_difference_percent.toFixed(1)}% vs fair value`,
      icon: sc.icon,
      accent: status === 'Underpriced' ? 'green' : status === 'Overpriced' ? 'orange' : 'blue',
      statusColor: sc.color,
    },
    {
      title: 'Negotiation Gap',
      value: negotiation_gap > 0
        ? <AnimatedNumber value={negotiation_gap} suffix=" units" />
        : 'None',
      subtitle: negotiation_gap > 0
        ? 'Amount above fair value'
        : 'No negotiation needed',
      icon: <DollarSign className="w-5 h-5 text-yellow-400" />,
      accent: 'yellow',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Result Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="glass-card p-5 relative overflow-hidden group"
          >
            {/* Accent glow */}
            <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity
              ${card.accent === 'emerald' ? 'bg-emerald-500' : ''}
              ${card.accent === 'blue' ? 'bg-blue-500' : ''}
              ${card.accent === 'green' ? 'bg-green-500' : ''}
              ${card.accent === 'orange' ? 'bg-orange-500' : ''}
              ${card.accent === 'yellow' ? 'bg-yellow-500' : ''}
            `} />

            <div className="flex items-center gap-2 mb-3">
              {card.icon}
              <span className="text-sm text-slate-400 font-medium">{card.title}</span>
            </div>
            <div className={`text-2xl font-bold mb-1 ${card.statusColor || 'text-white'}`}>
              {card.value}
            </div>
            <div className="text-xs text-slate-500">{card.subtitle}</div>
          </motion.div>
        ))}
      </div>

      {/* Deal Score Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-white mb-2">Deal Score</h3>
            <p className="text-slate-400 text-sm max-w-md">
              Composite score based on price fairness, transport access, property age, and nearby convenience. 
              Higher is better for the buyer.
            </p>
          </div>
          <DealScoreGauge score={deal_score} />
        </div>
      </motion.div>
    </div>
  );
};

export default ResultCards;
