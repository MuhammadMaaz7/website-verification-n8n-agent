"use client";

import { ValidationResult } from "./ValidationDashboard";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  result: ValidationResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const getStatusColor = () => {
    if (result.status === "processing" || result.status === "retrying") return "border-yellow-500/20 bg-yellow-500/5";
    if (result.status === "success" && result.isReachable) return "border-green-500/20 bg-green-500/5";
    if (result.status === "success" && !result.isReachable) return "border-red-500/20 bg-red-500/5";
    if (result.status === "error") return "border-red-500/20 bg-red-500/5";
    return "border-white/10 bg-white/5";
  };

  const getStatusIndicator = () => {
    if (result.status === "processing" || result.status === "retrying") {
      return <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 animate-pulse" />;
    }
    if (result.status === "success" && result.isReachable) {
      return <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />;
    }
    if (result.status === "error" || (result.status === "success" && !result.isReachable)) {
      return <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />;
    }
    return <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/30" />;
  };

  return (
    <div
      className={cn(
        "border rounded-lg sm:rounded-xl p-2.5 sm:p-4 lg:p-5 transition-all backdrop-blur-md",
        getStatusColor()
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-3 mb-1 sm:mb-2">
            {getStatusIndicator()}
            <h3 className="font-semibold text-white text-xs sm:text-base lg:text-lg truncate">{result.companyName}</h3>
          </div>
          <p className="text-[10px] sm:text-sm text-white/40 truncate font-mono">{result.url}</p>
        </div>
        {(result.status === "processing" || result.status === "retrying") && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-400 text-xs sm:text-sm flex-shrink-0">
            <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-yellow-400 border-t-transparent rounded-full" />
            <span className="hidden sm:inline">
              {result.status === "retrying" ? `Retrying (${result.retryCount}/2)` : "Processing"}
            </span>
          </div>
        )}
      </div>

      {result.status === "success" && (
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
          {result.redirectUrl && (
            <div className="flex items-start gap-2 text-yellow-400 bg-yellow-500/10 rounded-xl p-2 sm:p-3 border border-yellow-500/15">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="min-w-0 flex-1">
                <div className="font-medium mb-1 text-xs sm:text-sm">Redirect Detected</div>
                <div className="text-[10px] sm:text-xs opacity-80 break-all">{result.redirectUrl}</div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {result.brandPresence !== undefined && (
              <div className="backdrop-blur-md bg-white/5 rounded-xl p-2.5 sm:p-3 border border-white/10">
                <div className="text-[10px] sm:text-xs text-white/40 mb-1.5 sm:mb-2">Brand Presence</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/10 rounded-full h-1.5 sm:h-2">
                    <div
                      style={{ width: `${result.brandPresence}%` }}
                      className={cn(
                        "h-1.5 sm:h-2 rounded-full transition-all duration-700 ease-out",
                        result.brandPresence > 70 ? "bg-green-400" : 
                        result.brandPresence > 40 ? "bg-yellow-400" : 
                        "bg-red-400"
                      )}
                    />
                  </div>
                  <span className="text-white font-bold text-sm sm:text-lg">{result.brandPresence}%</span>
                </div>
              </div>
            )}
            {result.responseTime !== undefined && (
              <div className="backdrop-blur-md bg-white/5 rounded-xl p-2.5 sm:p-3 border border-white/10">
                <div className="text-[10px] sm:text-xs text-white/40 mb-1.5 sm:mb-2">Response Time</div>
                <div className="text-white font-bold text-sm sm:text-lg">{result.responseTime}ms</div>
              </div>
            )}
          </div>
        </div>
      )}

      {result.error && (
        <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-red-400 bg-red-500/10 rounded-xl p-2 sm:p-3 border border-red-500/15">
          <div className="font-medium mb-1">Error</div>
          <div className="text-[10px] sm:text-xs opacity-80">{result.error}</div>
        </div>
      )}
    </div>
  );
}
