"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import InputSection from "./InputSection";
import ResultsSection from "./ResultsSection";

export interface ValidationResult {
  id: string;
  companyName: string;
  url: string;
  status: "pending" | "processing" | "success" | "error";
  isReachable?: boolean;
  redirectUrl?: string;
  brandPresence?: number;
  responseTime?: number;
  error?: string;
}

export default function ValidationDashboard() {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleValidation = async (entries: { companyName: string; url: string }[]) => {
    setIsProcessing(true);
    
    const newResults: ValidationResult[] = entries.map((entry, idx) => ({
      id: `${Date.now()}-${idx}`,
      companyName: entry.companyName,
      url: entry.url,
      status: "pending",
    }));
    
    setResults(newResults);

    // Process each entry
    for (let i = 0; i < newResults.length; i++) {
      setResults(prev => 
        prev.map((r, idx) => 
          idx === i ? { ...r, status: "processing" } : r
        )
      );

      try {
        // Call n8n webhook
        const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "/api/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: newResults[i].companyName,
            url: newResults[i].url,
          }),
        });

        const data = await response.json();
        
        setResults(prev =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: "success",
                  isReachable: data.isReachable,
                  redirectUrl: data.redirectUrl,
                  brandPresence: data.brandPresence,
                  responseTime: data.responseTime,
                }
              : r
          )
        );
      } catch (error) {
        setResults(prev =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: "error",
                  error: error instanceof Error ? error.message : "Validation failed",
                }
              : r
          )
        );
      }
    }

    setIsProcessing(false);
  };

  return (
    <div className="w-full">
      {results.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          <InputSection onValidate={handleValidation} isProcessing={isProcessing} />
          <ResultsSection results={results} />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <InputSection onValidate={handleValidation} isProcessing={isProcessing} />
        </div>
      )}
    </div>
  );
}
