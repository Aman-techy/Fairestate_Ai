/**
 * Property Form Component
 * Clean, modern form for inputting property details.
 * Uses dataset-relevant fields only (no fake bedrooms/bathrooms).
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Home, Train, Store, MapPin, Navigation, DollarSign,
  Send, RotateCcw, Info, Loader2
} from 'lucide-react';

const PropertyForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    transaction_date: '2013.25',
    house_age: '',
    distance_to_mrt: '',
    convenience_stores: '',
    latitude: '',
    longitude: '',
    asking_price: '',
  });

  const [errors, setErrors] = useState({});

  // Field configuration with labels, icons, and help text
  const fields = [
    {
      key: 'transaction_date',
      label: 'Transaction Date',
      icon: <Calendar className="w-4 h-4" />,
      placeholder: 'e.g., 2013.25',
      help: 'Decimal year format (2013.25 = March 2013)',
      type: 'number',
      step: 'any',
      min: '2012',
      max: '2025',
    },
    {
      key: 'house_age',
      label: 'House Age (years)',
      icon: <Home className="w-4 h-4" />,
      placeholder: 'e.g., 12.5',
      help: 'Age of the property in years',
      type: 'number',
      step: '0.1',
      min: '0',
      max: '100',
    },
    {
      key: 'distance_to_mrt',
      label: 'Distance to Nearest MRT (meters)',
      icon: <Train className="w-4 h-4" />,
      placeholder: 'e.g., 500',
      help: 'Walking distance to closest MRT station',
      type: 'number',
      step: '1',
      min: '0',
      max: '10000',
    },
    {
      key: 'convenience_stores',
      label: 'Nearby Convenience Stores',
      icon: <Store className="w-4 h-4" />,
      placeholder: 'e.g., 5',
      help: 'Number of convenience stores in the area',
      type: 'number',
      step: '1',
      min: '0',
      max: '20',
    },
    {
      key: 'latitude',
      label: 'Latitude',
      icon: <MapPin className="w-4 h-4" />,
      placeholder: 'e.g., 24.98',
      help: 'Geographic latitude coordinate',
      type: 'number',
      step: '0.00001',
    },
    {
      key: 'longitude',
      label: 'Longitude',
      icon: <Navigation className="w-4 h-4" />,
      placeholder: 'e.g., 121.54',
      help: 'Geographic longitude coordinate',
      type: 'number',
      step: '0.00001',
    },
    {
      key: 'asking_price',
      label: 'Asking Price (per unit area)',
      icon: <DollarSign className="w-4 h-4" />,
      placeholder: 'e.g., 50',
      help: 'The listed / asking price per unit area',
      type: 'number',
      step: '0.1',
      min: '0',
    },
  ];

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (!formData[field.key] && formData[field.key] !== 0) {
        newErrors[field.key] = 'This field is required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert all values to proper types
    const payload = {
      transaction_date: parseFloat(formData.transaction_date),
      house_age: parseFloat(formData.house_age),
      distance_to_mrt: parseFloat(formData.distance_to_mrt),
      convenience_stores: parseInt(formData.convenience_stores),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      asking_price: parseFloat(formData.asking_price),
    };

    onSubmit(payload);
  };

  const handleReset = () => {
    setFormData({
      transaction_date: '2013.25',
      house_age: '',
      distance_to_mrt: '',
      convenience_stores: '',
      latitude: '',
      longitude: '',
      asking_price: '',
    });
    setErrors({});
  };

  // Quick fill with sample data for demo
  const fillSample = () => {
    setFormData({
      transaction_date: '2013.25',
      house_age: '15.0',
      distance_to_mrt: '350',
      convenience_stores: '7',
      latitude: '24.97',
      longitude: '121.54',
      asking_price: '45',
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="section-heading mb-3">Analyze a Property</h1>
          <p className="text-slate-400 text-lg">
            Enter property details below and let our AI agents evaluate the deal.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-5">
              {fields.map((field, index) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className={field.key === 'asking_price' ? 'md:col-span-2' : ''}
                >
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-400">{field.icon}</span>
                      {field.label}
                    </span>
                  </label>
                  <input
                    type={field.type}
                    step={field.step}
                    min={field.min}
                    max={field.max}
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className={`glass-input ${errors[field.key] ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''} ${field.key === 'asking_price' ? 'text-lg font-semibold' : ''}`}
                  />
                  {errors[field.key] && (
                    <p className="text-red-400 text-xs mt-1">{errors[field.key]}</p>
                  )}
                  <p className="text-slate-600 text-xs mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {field.help}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI Agents Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Analyze Property
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={fillSample}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Info className="w-4 h-4" />
                Fill Sample
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </form>
        </motion.div>

        {/* Info note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-600 text-sm mt-6"
        >
          Analysis is powered by a Random Forest model trained on 414 real estate transactions.
        </motion.p>
      </div>
    </div>
  );
};

export default PropertyForm;
