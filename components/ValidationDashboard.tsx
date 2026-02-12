"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import InputSection from "./InputSection";
import ResultsSection from "./ResultsSection";
import ToastContainer, { ToastMessage } from "./ToastContainer";

export interface ValidationResult {
  id: string;
  companyName: string;
  url: string;
  status: "pending" | "processing" | "success" | "error" | "retrying";
  isReachable?: boolean;
  redirectUrl?: string;
  verdict?: string;
  riskScore?: number;
  dataJson?: {
    brand_match?: boolean;
    confidence_score?: number;
    summary?: string;
    detected_name?: string;
    url?: string;
  };
  error?: string;
  retryCount?: number;
}

export default function ValidationDashboard() {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast helper functions
  const showToast = (message: string, type: ToastMessage["type"]) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleValidation = async (entries: { companyName: string; url: string }[]) => {
    // Check if backend URL is configured
    if (!process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL) {
      showToast("⚠️ Service not configured. Please contact support.", "error");
      return;
    }

    setIsProcessing(true);
    showToast(`Validating ${entries.length} ${entries.length === 1 ? 'website' : 'websites'}...`, "info");
    
    const newResults: ValidationResult[] = entries.map((entry, idx) => ({
      id: `${Date.now()}-${idx}`,
      companyName: entry.companyName,
      url: entry.url,
      status: "pending",
      retryCount: 0,
    }));
    
    setResults(newResults);

    // Send all entries as a single batch request to n8n
    try {
      const apiUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for batch

      // Update all to processing
      setResults(prev => prev.map(r => ({ ...r, status: "processing" as const })));

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(entries),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`Backend error ${response.status}:`, await response.text().catch(() => 'Unknown error'));
        throw new Error("SERVICE_ERROR");
      }

      const data = await response.json();

      // n8n returns: [{ success, total_processed, data: [...items...] }]
      // Unwrap to get the items array
      let items: any[] = [];
      if (Array.isArray(data) && data.length > 0 && data[0]?.data) {
        items = data[0].data;
      } else if (Array.isArray(data)) {
        items = data;
      } else if (data?.data && Array.isArray(data.data)) {
        items = data.data;
      } else {
        items = [data];
      }

      setResults(prev =>
        prev.map((r, idx) => {
          try {
            const itemData = items[idx];
            if (!itemData) {
              return { ...r, status: "error" as const, error: "No result returned for this entry" };
            }
            const mapped = mapResponseData(itemData);
            return { ...r, status: "success" as const, ...mapped };
          } catch {
            return { ...r, status: "error" as const, error: "Invalid response for this entry" };
          }
        })
      );
    } catch (error) {
      console.error("Batch validation error:", error);

      const isTimeout = error instanceof Error && error.name === "AbortError";
      const isNetworkError = error instanceof Error && (
        error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("Failed to fetch")
      );

      let userMessage = "Unable to validate websites";
      if (isTimeout) userMessage = "Validation timed out. Please try again.";
      else if (isNetworkError) userMessage = "Connection issue. Please check your internet.";
      else if (error instanceof Error && error.message === "SERVICE_ERROR") userMessage = "Service temporarily unavailable";

      setResults(prev =>
        prev.map(r => ({
          ...r,
          status: "error" as const,
          error: userMessage,
          isReachable: false,
          brandPresence: 0,
        }))
      );
    }

    setIsProcessing(false);
    
    // Show completion toast (read latest results via callback)
    setResults(prev => {
      const successCount = prev.filter(r => r.status === "success").length;
      const errorCount = prev.filter(r => r.status === "error").length;

      if (errorCount === 0) {
        showToast(`✓ All validations completed successfully!`, "success");
      } else if (successCount === 0) {
        showToast(`Unable to complete validations. Please try again.`, "error");
      } else {
        showToast(`Completed: ${successCount} successful, ${errorCount} failed`, "warning");
      }
      return prev;
    });
  };

  // Map a single n8n result item to frontend format
  const mapResponseData = (item: any) => {
    try {
      // Parse data_json if it's a string
      let dataJson: any = {};
      if (item.data_json) {
        try {
          dataJson = typeof item.data_json === "string" ? JSON.parse(item.data_json) : item.data_json;
        } catch {
          console.warn("Failed to parse data_json:", item.data_json);
        }
      }

      const isVerified = item.verdict === "VERIFIED";
      const redirected = item.url && item.original_url && item.url !== item.original_url;

      return {
        isReachable: isVerified,
        url: item.url || item.original_url,
        redirectUrl: redirected ? item.url : undefined,
        verdict: item.verdict ?? "UNKNOWN",
        riskScore: item.risk_score ?? 0,
        dataJson: dataJson,
        companyName: item.company_name || item.companyName,
        error: isVerified ? undefined : (dataJson.summary ?? item.verdict ?? "Verification failed"),
      };
    } catch (error) {
      console.error("Response mapping error:", error);
      throw new Error("Invalid response format");
    }
  };

  return (
    <div className="w-full space-y-6 lg:space-y-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Input Section - Always visible at top */}
      <div className="w-full max-w-5xl mx-auto">
        <InputSection onValidate={handleValidation} isProcessing={isProcessing} />
      </div>

      {/* Results Section - Shows below input when available */}
      {results.length > 0 && (
        <div className="w-full max-w-7xl mx-auto">
          <ResultsSection results={results} />
        </div>
      )}
    </div>
  );
}
