/**
 * Navbar Component
 * Sticky navigation bar with glassmorphism effect.
 * Shows FairEstate AI branding and navigation controls.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Building2, BarChart3, ArrowLeft } from 'lucide-react';

const Navbar = ({ currentPage, onNavigate }) => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-navy-900/80 backdrop-blur-xl border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('landing')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Fair</span>
              <span className="text-emerald-400">Estate</span>
              <span className="text-slate-400 font-medium ml-1.5">AI</span>
            </span>
          </motion.div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {currentPage !== 'landing' && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onNavigate('landing')}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </motion.button>
            )}
            {currentPage === 'landing' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('analyzer')}
                className="btn-primary text-sm !px-5 !py-2.5"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analyze Property
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
