"use client";

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
    <div className="relative w-full">
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 tracking-tight">Results</h2>
            <p className="text-white/40 text-[10px] sm:text-xs lg:text-sm">Validation results and analytics</p>
          </div>
          <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button 
              onClick={() => exportToCSV(results)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm font-medium text-white/70 border border-white/15 backdrop-blur-md bg-white/5 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              Export CSV
            </button>
            <button 
              onClick={() => exportToJSON(results)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm font-medium text-white/70 border border-white/15 backdrop-blur-md bg-white/5 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              Export JSON
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-3 mb-3 sm:mb-6">
          <StatCard label="Total" value={stats.total} color="white" />
          <StatCard label="Success" value={stats.success} color="green" />
          <StatCard label="Failed" value={stats.failed} color="red" />
          <StatCard label="Processing" value={stats.processing} color="yellow" />
        </div>

        <div className="space-y-1.5 sm:space-y-3 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto custom-scrollbar">
          {results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    white: "border-white/10 bg-white/5 text-white",
    green: "border-green-500/20 bg-green-500/10 text-green-400",
    red: "border-red-500/20 bg-red-500/10 text-red-400",
    yellow: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
  };

  return (
    <div className={`border rounded-lg sm:rounded-xl p-2 sm:p-4 text-center backdrop-blur-md ${colors[color] || colors.white}`}>
      <div className="text-lg sm:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1">{value}</div>
      <div className="text-[9px] sm:text-xs opacity-60 uppercase tracking-wide">{label}</div>
    </div>
  );
}
