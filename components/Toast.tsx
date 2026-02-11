"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: "from-emerald-500/90 to-green-600/90 border-emerald-400/50",
    error: "from-red-500/90 to-red-600/90 border-red-400/50",
    info: "from-blue-500/90 to-blue-600/90 border-blue-400/50",
    warning: "from-yellow-500/90 to-yellow-600/90 border-yellow-400/50",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={`fixed top-4 right-4 z-50 max-w-md`}
    >
      <div className={`bg-gradient-to-r ${colors[type]} backdrop-blur-xl border rounded-xl shadow-2xl p-4 flex items-start gap-3`}>
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
