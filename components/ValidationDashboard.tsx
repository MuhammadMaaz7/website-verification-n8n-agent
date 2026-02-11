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
    setIsProcessing(true);
    showToast(`Starting validation of ${entries.length} ${entries.length === 1 ? 'website' : 'websites'}...`, "info");
    
    const newResults: ValidationResult[] = entries.map((entry, idx) => ({
      id: `${Date.now()}-${idx}`,
      companyName: entry.companyName,
      url: entry.url,
      status: "pending",
      retryCount: 0,
    }));
    
    setResults(newResults);

    // Process each entry sequentially with retry logic
    for (let i = 0; i < newResults.length; i++) {
      await processWithRetry(i, newResults[i]);

      // Small delay between requests to avoid overwhelming the server
      if (i < newResults.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    setIsProcessing(false);
    
    // Show completion toast
    const successCount = results.filter(r => r.status === "success").length;
    const errorCount = results.filter(r => r.status === "error").length;
    
    if (errorCount === 0) {
      showToast(`✓ All ${entries.length} validations completed successfully!`, "success");
    } else if (successCount === 0) {
      showToast(`✕ All validations failed. Please check your connection.`, "error");
    } else {
      showToast(`Completed: ${successCount} successful, ${errorCount} failed`, "warning");
    }
  };

  // Process single entry with retry logic
  const processWithRetry = async (index: number, entry: ValidationResult, retryCount = 0) => {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1000; // 1 second

    // Update status to processing or retrying
    setResults(prev => 
      prev.map((r, idx) => 
        idx === index ? { 
          ...r, 
          status: retryCount > 0 ? "retrying" : "processing",
          retryCount 
        } : r
      )
    );

    const startTime = Date.now();

    try {
      // Call n8n webhook or fallback to mock API
      const apiUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "/api/validate";
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          companyName: entry.companyName,
          url: entry.url,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      // Handle both n8n format and mock API format
      const mappedData = mapResponseData(data, responseTime);
      
      setResults(prev =>
        prev.map((r, idx) =>
          idx === index
            ? {
                ...r,
                status: "success",
                ...mappedData,
              }
            : r
        )
      );
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      const isNetworkError = error instanceof Error && error.message.includes('fetch');
      
      // Retry logic for network errors and timeouts
      if ((isTimeout || isNetworkError) && retryCount < MAX_RETRIES) {
        console.log(`Retrying ${entry.companyName} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return processWithRetry(index, entry, retryCount + 1);
      }

      // Final error state
      const errorMessage = isTimeout 
        ? "Request timed out after 30 seconds"
        : error instanceof Error 
          ? error.message 
          : "Validation failed";

      setResults(prev =>
        prev.map((r, idx) =>
          idx === index
            ? {
                ...r,
                status: "error",
                error: errorMessage + (retryCount > 0 ? ` (after ${retryCount} retries)` : ''),
                responseTime,
                isReachable: false,
                brandPresence: 0,
              }
            : r
        )
      );
    }
  };

  // Map n8n response format to frontend format
  const mapResponseData = (data: any, responseTime: number) => {
    // Check if it's n8n format (has 'data' array)
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
    
    // Check if it's already in the correct format (mock API)
    if (data.isReachable !== undefined) {
      return {
        isReachable: data.isReachable,
        redirectUrl: data.redirectUrl,
        brandPresence: data.brandPresence,
        responseTime: data.responseTime ?? responseTime,
        error: data.error,
      };
    }
    
    // Fallback: try to extract what we can
    return {
      isReachable: data.verification_results?.is_live ?? false,
      redirectUrl: data.technical_metadata?.redirect_detected 
        ? data.technical_metadata?.final_url 
        : undefined,
      brandPresence: data.ai_insight?.confidence ?? 0,
      responseTime: responseTime,
      error: data.error,
    };
  };

  return (
    <div className="w-full">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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
