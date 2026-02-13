"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface InputSectionProps {
  onValidate: (entries: { companyName: string; url: string }[]) => void;
  isProcessing: boolean;
}

export default function InputSection({ onValidate, isProcessing }: InputSectionProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "csv" | "bulk">("csv");
  const [companyName, setCompanyName] = useState("");
  const [url, setUrl] = useState("");
  const [bulkText, setBulkText] = useState("");

  const handleManualSubmit = () => {
    if (companyName && url) {
      onValidate([{ companyName, url: cleanUrl(url) }]);
      setCompanyName("");
      setUrl("");
    }
  };

  const cleanUrl = (raw: string): string => {
    let url = raw.trim().split(/\s+/)[0]; // take only the first "word" (the actual URL)
    if (url && !/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    return url;
  };

  const handleBulkSubmit = () => {
    const lines = bulkText.trim().split("\n");
    const entries = lines
      .map(line => {
        const commaIdx = line.indexOf(",");
        if (commaIdx === -1) return null;
        const companyName = line.slice(0, commaIdx).trim();
        const url = cleanUrl(line.slice(commaIdx + 1));
        return companyName && url ? { companyName, url } : null;
      })
      .filter(Boolean) as { companyName: string; url: string }[];
    
    if (entries.length > 0) {
      onValidate(entries);
      setBulkText("");
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert(`File size exceeds 5MB limit. Please upload a smaller file.\nCurrent size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      e.target.value = '';
      return;
    }

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file (.csv extension)');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      e.target.value = '';
    };

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        
        if (!text || text.trim().length === 0) {
          alert('CSV file is empty. Please upload a file with data.');
          e.target.value = '';
          return;
        }

        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        if (lines.length < 2) {
          alert('CSV file must contain a header row and at least one data row.');
          e.target.value = '';
          return;
        }

        const dataLines = lines.slice(1);
        
        const entries = dataLines
          .map((line, index) => {
            // Split CSV line by comma, respecting quoted fields
            const fields = line.split(',').reduce<string[]>((acc, field) => {
              const last = acc.length - 1;
              if (last >= 0 && (acc[last].match(/"/g) || []).length % 2 !== 0) {
                acc[last] += ',' + field;
              } else {
                acc.push(field);
              }
              return acc;
            }, []);
            
            if (fields.length < 2) {
              console.warn(`Skipping invalid row ${index + 2}: ${line}`);
              return null;
            }

            const companyName = fields[0].replace(/^"|"$/g, '').trim();
            let url = fields[1].replace(/^"|"$/g, '').trim().split(/\s+/)[0]; // take only the URL, drop trailing text

            if (!companyName || !url) {
              console.warn(`Skipping incomplete row ${index + 2}: missing company name or URL`);
              return null;
            }

            if (!url.match(/^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+/)) {
              console.warn(`Skipping invalid URL in row ${index + 2}: ${url}`);
              return null;
            }

            // Ensure URL has protocol
            if (!/^https?:\/\//i.test(url)) {
              url = `https://${url}`;
            }

            return { companyName, url };
          })
          .filter(Boolean) as { companyName: string; url: string }[];
        
        if (entries.length === 0) {
          alert('No valid entries found in CSV. Please check the format:\ncompany_name, url');
          e.target.value = '';
          return;
        }

        const MAX_ENTRIES = 100;
        if (entries.length > MAX_ENTRIES) {
          const proceed = confirm(
            `CSV contains ${entries.length} entries. Only the first ${MAX_ENTRIES} will be processed.\n\nContinue?`
          );
          if (!proceed) {
            e.target.value = '';
            return;
          }
          onValidate(entries.slice(0, MAX_ENTRIES));
        } else {
          onValidate(entries);
        }

        e.target.value = '';
      } catch (error) {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file. Please check the format and try again.');
        e.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="relative w-full max-w-3xl lg:max-w-5xl mx-auto">
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-8">
        {/* Tabs */}
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide">
            {[
              { id: "csv", label: "CSV Upload" },
              { id: "manual", label: "Manual" },
              { id: "bulk", label: "Bulk Paste" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0",
                  activeTab === tab.id
                    ? "bg-white text-black shadow-lg shadow-white/10"
                    : "text-white/60 hover:text-white border border-white/10 hover:bg-white/5"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[120px] sm:min-h-[120px] flex items-center">
          {/* CSV Upload */}
          {activeTab === "csv" && (
            <div className="w-full">
              <div className="flex flex-col gap-3 sm:gap-4 items-center">
                <div className="flex-1 w-full">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    disabled={isProcessing}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="flex items-center gap-2 sm:gap-4 p-3 sm:p-5 border border-dashed border-white/20 rounded-lg sm:rounded-xl hover:border-white/40 transition-all cursor-pointer bg-white/5 group"
                  >
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-all flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold mb-0.5 sm:mb-1 text-xs sm:text-base">
                        Drop CSV file or click to upload
                      </p>
                      <p className="text-xs sm:text-sm text-white/40 truncate">
                        Format: company_name, url
                      </p>
                    </div>
                  </label>
                </div>

                {/* <a
                  href="/sample-companies.csv"
                  download
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-sm font-medium text-white/70 border border-white/15 backdrop-blur-md bg-white/5 hover:bg-white/10 hover:text-white transition-all w-full sm:w-auto justify-center"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Sample CSV
                </a> */}
              </div>
            </div>
          )}

          {/* Manual Entry */}
          {activeTab === "manual" && (
            <div className="w-full flex flex-col gap-3">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company Name"
                className="w-full px-3 sm:px-5 py-2.5 sm:py-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all text-xs sm:text-base"
              />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 sm:px-5 py-2.5 sm:py-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all text-xs sm:text-base"
              />
              <button
                onClick={handleManualSubmit}
                disabled={isProcessing || !companyName || !url}
                className="w-full px-5 py-2.5 sm:py-3 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all duration-200 shadow-lg shadow-white/20 disabled:bg-white/20 disabled:text-white/40 disabled:shadow-none disabled:cursor-not-allowed text-xs sm:text-base cursor-pointer"
              >
                {isProcessing ? "Processing..." : "Validate"}
              </button>
            </div>
          )}

          {/* Bulk Paste */}
          {activeTab === "bulk" && (
            <div className="w-full flex flex-col gap-3">
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Google, google.com (new line) GitHub, github.com (new line) Microsoft, microsoft.com"
                rows={4}
                className="w-full px-3 sm:px-5 py-2.5 sm:py-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 font-mono text-[10px] sm:text-sm transition-all resize-none"
              />
              <button
                onClick={handleBulkSubmit}
                disabled={isProcessing || !bulkText.trim()}
                className="w-full px-5 py-2.5 sm:py-3 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all duration-200 shadow-lg shadow-white/20 disabled:bg-white/20 disabled:text-white/40 disabled:shadow-none disabled:cursor-not-allowed text-xs sm:text-base cursor-pointer"
              >
                {isProcessing ? "Processing..." : "Validate All"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
