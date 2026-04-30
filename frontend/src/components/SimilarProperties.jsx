/**
 * Similar Properties Component
 * Displays a table/card view of 3-5 similar properties from the dataset.
 * Found by the Comparable Property Agent using Euclidean distance.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Home, Train, Store, MapPin, DollarSign } from 'lucide-react';

const SimilarProperties = ({ properties, predictedPrice }) => {
  if (!properties || properties.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className="glass-card p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <Users className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Similar Properties</h3>
          <p className="text-sm text-slate-500">
            {properties.length} most similar properties found in our database
          </p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs text-slate-500 uppercase tracking-wider py-3 px-4">#</th>
              <th className="text-left text-xs text-slate-500 uppercase tracking-wider py-3 px-4">
                <span className="flex items-center gap-1"><Home className="w-3 h-3" /> Age</span>
              </th>
              <th className="text-left text-xs text-slate-500 uppercase tracking-wider py-3 px-4">
                <span className="flex items-center gap-1"><Train className="w-3 h-3" /> MRT Dist.</span>
              </th>
              <th className="text-left text-xs text-slate-500 uppercase tracking-wider py-3 px-4">
                <span className="flex items-center gap-1"><Store className="w-3 h-3" /> Stores</span>
              </th>
              <th className="text-left text-xs text-slate-500 uppercase tracking-wider py-3 px-4">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</span>
              </th>
              <th className="text-right text-xs text-slate-500 uppercase tracking-wider py-3 px-4">
                <span className="flex items-center gap-1 justify-end"><DollarSign className="w-3 h-3" /> Price</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.map((prop, index) => {
              // Color the price based on comparison to predicted
              const priceDiff = ((prop.actual_price - predictedPrice) / predictedPrice) * 100;
              const priceColor = priceDiff < -5 ? 'text-green-400' : priceDiff > 5 ? 'text-orange-400' : 'text-blue-400';

              return (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-500 text-sm">{index + 1}</td>
                  <td className="py-3 px-4 text-slate-300 text-sm">{prop.house_age} yrs</td>
                  <td className="py-3 px-4 text-slate-300 text-sm">{prop.distance_to_mrt.toFixed(0)}m</td>
                  <td className="py-3 px-4 text-slate-300 text-sm">{prop.convenience_stores}</td>
                  <td className="py-3 px-4 text-slate-400 text-xs font-mono">
                    {prop.latitude.toFixed(4)}, {prop.longitude.toFixed(4)}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold text-sm ${priceColor}`}>
                    {prop.actual_price.toFixed(1)}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {properties.map((prop, index) => {
          const priceDiff = ((prop.actual_price - predictedPrice) / predictedPrice) * 100;
          const priceColor = priceDiff < -5 ? 'text-green-400' : priceDiff > 5 ? 'text-orange-400' : 'text-blue-400';

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + index * 0.1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/5"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-slate-500">Property #{index + 1}</span>
                <span className={`text-lg font-bold ${priceColor}`}>{prop.actual_price.toFixed(1)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1"><Home className="w-3 h-3" /> {prop.house_age} yrs old</div>
                <div className="flex items-center gap-1"><Train className="w-3 h-3" /> {prop.distance_to_mrt.toFixed(0)}m to MRT</div>
                <div className="flex items-center gap-1"><Store className="w-3 h-3" /> {prop.convenience_stores} stores</div>
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {prop.latitude.toFixed(3)}, {prop.longitude.toFixed(3)}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary note */}
      <div className="mt-4 p-3 rounded-lg bg-white/5 text-xs text-slate-500">
        💡 Properties are ranked by similarity using house age, MRT distance, convenience stores, and geographic location.
        Prices are color-coded: <span className="text-green-400">green</span> = below predicted, 
        <span className="text-blue-400"> blue</span> = near predicted, 
        <span className="text-orange-400"> orange</span> = above predicted.
      </div>
    </motion.div>
  );
};

export default SimilarProperties;
