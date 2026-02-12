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
  brandPresence?: number;
  responseTime?: number;
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
      const responseTime = Date.now() - Date.now(); // per-item timing not available in batch

      // Handle response — expect an array of results matching entries order
      const resultsArray = Array.isArray(data) ? data : [data];

      setResults(prev =>
        prev.map((r, idx) => {
          try {
            const itemData = resultsArray[idx];
            if (!itemData) {
              return { ...r, status: "error" as const, error: "No result returned for this entry" };
            }
            const mapped = mapResponseData(itemData, responseTime);
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

  // Map n8n response format to frontend format
  const mapResponseData = (data: any, responseTime: number) => {
    try {
      // n8n format (has 'data' array)
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const item = data.data[0];
        return {
          isReachable: item.status?.live ?? false,
          redirectUrl: item.technical?.redirected ? item.technical?.final_url : undefined,
          brandPresence: item.status?.confidence ?? 0,
          responseTime: responseTime,
          error: item.verdict === "SUCCESS" ? undefined : item.ai_evidence,
        };
      }
      
      // Alternative n8n format (direct fields)
      if (data.verification_results) {
        return {
          isReachable: data.verification_results?.is_live ?? false,
          redirectUrl: data.technical_metadata?.redirect_detected 
            ? data.technical_metadata?.final_url 
            : undefined,
          brandPresence: data.ai_insight?.confidence ?? 0,
          responseTime: responseTime,
          error: data.error,
        };
      }
      
      // Log unexpected format for debugging
      console.error('Unexpected response format:', data);
      throw new Error("Invalid response format from backend. Please check n8n workflow configuration.");
    } catch (error) {
      console.error('Response mapping error:', error);
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
