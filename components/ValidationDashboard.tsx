"use client";

import { useState } from "react";
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

    const apiUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!;
    const TIMEOUT_MS = 60000; // 60-second window

    // Update all to processing
    setResults(prev => prev.map(r => ({ ...r, status: "processing" as const })));

    // Fire all requests in parallel — each result updates individually as it resolves
    const promises = entries.map((entry, idx) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      return fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(entry),
        signal: controller.signal,
      })
        .then(async (response) => {
          clearTimeout(timeoutId);
          if (!response.ok) {
            console.error(`Backend error ${response.status} for ${entry.companyName}`);
            throw new Error("SERVICE_ERROR");
          }
          
          // Check if response has content
          const text = await response.text();
          if (!text || text.trim() === "") {
            console.error(`Empty response from backend for ${entry.companyName}`);
            throw new Error("EMPTY_RESPONSE");
          }
          
          // Try to parse JSON
          try {
            return JSON.parse(text);
          } catch (parseError) {
            console.error(`Invalid JSON response for ${entry.companyName}:`, text);
            throw new Error("INVALID_JSON");
          }
        })
        .then((data) => {
          // Unwrap n8n response: could be [{ data: [...] }], { data: [...] }, or direct item
          let item: any = data;
          if (Array.isArray(data) && data.length > 0) {
            item = data[0]?.data?.[0] ?? data[0];
          } else if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
            item = data.data[0];
          }

          const mapped = mapResponseData(item);
          setResults(prev =>
            prev.map((r, i) =>
              i === idx ? { ...r, status: "success" as const, ...mapped } : r
            )
          );
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          console.error(`Validation error for ${entry.companyName}:`, error);

          const isTimeout = error instanceof Error && error.name === "AbortError";
          const isNetworkError = error instanceof Error && (
            error.message.includes("fetch") ||
            error.message.includes("network") ||
            error.message.includes("Failed to fetch")
          );

          let userMessage = "Unable to validate this website";
          if (isTimeout) userMessage = "Validation timed out (60s). Please try again.";
          else if (isNetworkError) userMessage = "Connection issue. Please check your internet.";
          else if (error instanceof Error && error.message === "SERVICE_ERROR") userMessage = "Service temporarily unavailable";
          else if (error instanceof Error && error.message === "EMPTY_RESPONSE") userMessage = "Service returned no data. Please try again.";
          else if (error instanceof Error && error.message === "INVALID_JSON") userMessage = "Service returned invalid data. Please contact support.";

          setResults(prev =>
            prev.map((r, i) =>
              i === idx
                ? { ...r, status: "error" as const, error: userMessage, isReachable: false }
                : r
            )
          );
        });
    });

    // Wait for all requests to settle (success or fail)
    await Promise.allSettled(promises);

    setIsProcessing(false);
    
    // Show completion toast (read latest results via callback)
    setResults(prev => {
      const successCount = prev.filter(r => r.status === "success" && r.isReachable).length;
      const errorCount = prev.filter(r => r.status === "error" || (r.status === "success" && !r.isReachable)).length;

      if (errorCount === 0 && successCount > 0) {
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
