"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ValidationResult } from "./ValidationDashboard";
import ResultCard from "./ResultCard";
import { exportToCSV, exportToJSON } from "@/lib/export";

interface ResultsSectionProps {
  results: ValidationResult[];
}

export default function ResultsSection({ results }: ResultsSectionProps) {
  const stats = {
    total: results.length,
    success: results.filter(r => r.status === "success" && r.isReachable).length,
    failed: results.filter(r => r.status === "success" && !r.isReachable).length,
    processing: results.filter(r => r.status === "processing").length,
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-gradient-to-b from-zinc-900/90 to-black/90 backdrop-blur-2xl border border-emerald-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Results</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Validation results and analytics</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => exportToCSV(results)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-black/40 hover:bg-black/60 border border-emerald-500/30 text-emerald-400 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all"
            >
              CSV
            </button>
            <button 
              onClick={() => exportToJSON(results)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-black/40 hover:bg-black/60 border border-green-500/30 text-green-400 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all"
            >
              JSON
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <StatCard label="Total" value={stats.total} color="emerald" />
          <StatCard label="Success" value={stats.success} color="green" />
          <StatCard label="Failed" value={stats.failed} color="red" />
          <StatCard label="Processing" value={stats.processing} color="yellow" />
        </div>

        <div className="space-y-2 sm:space-y-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {results.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    emerald: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400",
    green: "from-green-500/20 to-green-600/20 border-green-500/30 text-green-400",
    red: "from-red-500/20 to-red-600/20 border-red-500/30 text-red-400",
    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400",
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} border rounded-lg sm:rounded-xl p-3 sm:p-4 text-center`}>
      <div className="text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1">{value}</div>
      <div className="text-[10px] sm:text-xs opacity-80 uppercase tracking-wide">{label}</div>
    </div>
  );
}
