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
      showToast(`✓ All validations completed successfully!`, "success");
    } else if (successCount === 0) {
      showToast(`Unable to complete validations. Please try again.`, "error");
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
      // Get n8n webhook URL from environment
      const apiUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      
      if (!apiUrl) {
        throw new Error("SERVICE_NOT_CONFIGURED");
      }

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
        // Log technical error for debugging
        console.error(`Backend error ${response.status}:`, await response.text().catch(() => 'Unknown error'));
        throw new Error("SERVICE_ERROR");
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      // Handle n8n response format
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
      
      // Log technical error for debugging
      console.error('Validation error:', error);
      
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      const isNetworkError = error instanceof Error && (
        error.message.includes('fetch') || 
        error.message.includes('network') ||
        error.message.includes('Failed to fetch')
      );
      const isConfigError = error instanceof Error && error.message === 'SERVICE_NOT_CONFIGURED';
      
      // Retry logic for network errors and timeouts (not config or service errors)
      if ((isTimeout || isNetworkError) && retryCount < MAX_RETRIES && !isConfigError) {
        console.log(`Retrying ${entry.companyName} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return processWithRetry(index, entry, retryCount + 1);
      }

      // User-friendly error messages
      let userMessage = "Unable to validate this website";
      
      if (isConfigError) {
        userMessage = "Service not configured";
      } else if (isTimeout) {
        userMessage = "Validation is taking too long. Please try again.";
      } else if (isNetworkError) {
        userMessage = "Connection issue. Please check your internet.";
      } else if (error instanceof Error && error.message === 'SERVICE_ERROR') {
        userMessage = "Service temporarily unavailable";
      } else if (error instanceof Error && error.message.includes('Invalid response')) {
        userMessage = "Received unexpected response";
      }

      if (retryCount > 0) {
        userMessage += ` (tried ${retryCount + 1} ${retryCount === 0 ? 'time' : 'times'})`;
      }

      setResults(prev =>
        prev.map((r, idx) =>
          idx === index
            ? {
                ...r,
                status: "error",
                error: userMessage,
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
