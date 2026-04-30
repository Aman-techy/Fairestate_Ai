/**
 * Landing Page Component
 * Premium hero section with features grid, how-it-works section,
 * and call-to-action. First impression of FairEstate AI.
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2, TrendingUp, Shield, Search, Scale, MapPin,
  ChevronRight, Sparkles, BarChart3, Target, Brain, Handshake,
  ArrowRight, CheckCircle2
} from 'lucide-react';

const LandingPage = ({ onAnalyze }) => {
  // Staggered animation for children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Price Prediction",
      description: "ML model trained on real market data to predict the fair value of any property."
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Fair Value Range",
      description: "Get the ±5% fair price range so you know exactly what's reasonable."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Deal Score (0–100)",
      description: "Instant scoring to quantify how good or bad a deal really is."
    },
    {
      icon: <Handshake className="w-6 h-6" />,
      title: "Negotiation Advice",
      description: "AI-powered buyer guidance on how much to negotiate."
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Similar Properties",
      description: "Compare with 5 similar properties from our database."
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Location Intelligence",
      description: "MRT proximity, convenience access, and neighborhood analysis."
    },
  ];

  const steps = [
    { num: "01", title: "Enter Property Details", desc: "Input house age, MRT distance, convenience stores, and location." },
    { num: "02", title: "AI Agents Analyze", desc: "5 AI agents evaluate pricing, location, fairness, and comparables." },
    { num: "03", title: "Get Deal Verdict", desc: "Receive a comprehensive analysis with price prediction, deal score, and advice." },
  ];

  const agents = [
    { name: "Valuation Agent", desc: "Predicts fair market value using Random Forest ML" },
    { name: "Fairness Agent", desc: "Classifies deal as Underpriced, Fair, or Overpriced" },
    { name: "Location Agent", desc: "Analyzes transport access and neighborhood quality" },
    { name: "Comparable Agent", desc: "Finds similar properties for price comparison" },
    { name: "Negotiation Agent", desc: "Generates buyer advice and deal score" },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 dot-pattern opacity-30" />
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
          <motion.div variants={container} initial="hidden" animate="show">
            {/* Badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Real Estate Intelligence
            </motion.div>

            {/* Main Headline */}
            <motion.h1 variants={item} className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6">
              <span className="text-white">Know the </span>
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">Fair Value</span>
              <br />
              <span className="text-white">Before You </span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Buy</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={item} className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Predict property value, detect overpriced listings, compare similar properties, 
              and get AI-powered negotiation suggestions — all in one platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onAnalyze}
                className="btn-primary text-lg !px-10 !py-4 flex items-center justify-center gap-2"
              >
                Analyze a Property
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <a
                href="#how-it-works"
                className="btn-secondary text-lg !px-8 !py-4 flex items-center justify-center gap-2"
              >
                How It Works
                <ChevronRight className="w-5 h-5" />
              </a>
            </motion.div>

            {/* Stats bar */}
            <motion.div variants={item} className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {[
                { value: "414+", label: "Properties Analyzed" },
                { value: "5", label: "AI Agents" },
                { value: "81.6%", label: "Accuracy (R²)" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── Why FairEstate AI ───────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="section-heading mb-4">Why FairEstate AI?</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Most tools only predict house prices. We go further — we tell you if it's a <span className="text-emerald-400 font-medium">good deal</span>.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={item}
                className="glass-card-hover p-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-navy-800/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-heading mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Three simple steps to a smarter property decision.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="glass-card p-8 text-center relative overflow-hidden">
                  {/* Step number watermark */}
                  <div className="absolute -top-4 -right-2 text-8xl font-black text-white/[0.03]">{step.num}</div>
                  
                  <div className="text-emerald-400 text-4xl font-black mb-4">{step.num}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.desc}</p>
                </div>
                
                {/* Connector arrow (not on last item) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-emerald-500/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Agents Section ───────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-heading mb-4">5 AI Agents Working For You</h2>
            <p className="text-slate-400 text-lg">Each agent specializes in a different aspect of property analysis.</p>
          </motion.div>

          <div className="space-y-4">
            {agents.map((agent, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{agent.name}</h3>
                  <p className="text-slate-400 text-sm">{agent.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Find the <span className="text-emerald-400">Fair Price</span>?
            </h2>
            <p className="text-slate-400 text-lg mb-10">
              Stop overpaying. Let AI analyze the property and give you the truth.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAnalyze}
              className="btn-primary text-lg !px-12 !py-4 flex items-center gap-3 mx-auto"
            >
              <BarChart3 className="w-5 h-5" />
              Analyze Property Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-8 border-t border-white/5 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span>FairEstate AI — AI-Powered Real Estate Valuation</span>
          </div>
          <div>Built with React, FastAPI, & Scikit-learn</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
