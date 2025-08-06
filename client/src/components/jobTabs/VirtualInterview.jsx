import React from 'react';
import { motion } from 'framer-motion';

const VirtualInterview = ({ application }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 md:p-8"
  >
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <Video className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">
        Virtual Interview Setup
      </h2>
      <p className="text-zinc-600 dark:text-zinc-400 mt-2">
        Schedule a virtual interview with {application?.fullName}
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Interview Date
        </label>
        <input
          type="date"
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Interview Time
        </label>
        <input
          type="time"
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Meeting Link
        </label>
        <input
          type="url"
          placeholder="https://meet.google.com/xxx-xxxx-xxx"
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Interview Agenda
        </label>
        <textarea
          rows={4}
          placeholder="Topics to cover, questions to ask, etc."
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        ></textarea>
      </div>
    </div>
    
    <div className="mt-8 flex justify-end gap-3">
      <button className="px-5 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
        Cancel
      </button>
      <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Schedule Interview
      </button>
    </div>
  </motion.div>
);

export default VirtualInterview;