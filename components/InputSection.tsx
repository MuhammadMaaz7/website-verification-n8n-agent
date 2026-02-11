"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
      onValidate([{ companyName, url }]);
      setCompanyName("");
      setUrl("");
    }
  };

  const handleBulkSubmit = () => {
    const lines = bulkText.trim().split("\n");
    const entries = lines
      .map(line => {
        const [companyName, url] = line.split(",").map(s => s.trim());
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

    // Validate file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      alert(`File size exceeds 5MB limit. Please upload a smaller file.\nCurrent size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file type
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

        // Parse CSV with proper handling of quoted fields and edge cases
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        if (lines.length < 2) {
          alert('CSV file must contain a header row and at least one data row.');
          e.target.value = '';
          return;
        }

        // Skip header row
        const dataLines = lines.slice(1);
        
        const entries = dataLines
          .map((line, index) => {
            // Handle quoted fields (e.g., "Company, Inc", "https://example.com")
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            
            if (!matches || matches.length < 2) {
              console.warn(`Skipping invalid row ${index + 2}: ${line}`);
              return null;
            }

            const companyName = matches[0].replace(/^"|"$/g, '').trim();
            const url = matches[1].replace(/^"|"$/g, '').trim();

            // Validate entries
            if (!companyName || !url) {
              console.warn(`Skipping incomplete row ${index + 2}: missing company name or URL`);
              return null;
            }

            // Basic URL validation
            if (!url.match(/^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+/)) {
              console.warn(`Skipping invalid URL in row ${index + 2}: ${url}`);
              return null;
            }

            return { companyName, url };
          })
          .filter(Boolean) as { companyName: string; url: string }[];
        
        if (entries.length === 0) {
          alert('No valid entries found in CSV. Please check the format:\ncompany_name, url');
          e.target.value = '';
          return;
        }

        // Limit number of entries to prevent overwhelming the system
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

        // Reset input for next upload
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
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Liquid stream flowing from header */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none -top-64 w-32 h-64 overflow-visible">
        {/* Main flowing stream with organic movement */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-24 h-full"
          animate={{
            scaleX: [1, 1.1, 0.95, 1.05, 1],
            x: [-2, 2, -1, 1, -2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-emerald-500/30 to-emerald-500/50 blur-2xl"></div>
        </motion.div>
        
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-12 h-full"
          animate={{
            scaleX: [1, 0.9, 1.1, 0.95, 1],
            x: [1, -2, 2, -1, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/0 via-emerald-400/50 to-emerald-500/70 blur-md"></div>
        </motion.div>

        {/* Flowing particles that follow the stream */}
        {[...Array(12)].map((_, i) => {
          const offsetX = Math.sin(i * 0.5) * 15 - 7.5;
          const offsetX2 = Math.sin(i * 0.5 + 1) * 20 - 10;
          const offsetX3 = Math.sin(i * 0.5 + 2) * 15 - 7.5;
          
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 -translate-x-1/2"
              animate={{
                y: [0, 280],
                opacity: [0, 0.6, 0.8, 0.6, 0],
                scale: [0.5, 1, 1.2, 1, 0.5],
                x: [offsetX, offsetX2, offsetX3],
              }}
              transition={{
                duration: 2.5 + i * 0.15,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            >
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full blur-[1px] shadow-lg shadow-emerald-400/60"></div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Smooth flowing glow on top edge - heavily blurred, no defined shapes */}
        <div className="absolute -top-6 left-1/5 right-1/6 h-5 pointer-events-none">
          {/* Multiple layers of flowing blur for organic effect */}
          <motion.div
            className="absolute inset-0 blur-3xl opacity-40"
            animate={{
              x: ["-30%", "30%", "-30%"],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          </motion.div>

          <motion.div
            className="absolute inset-0 blur-2xl opacity-30"
            animate={{
              x: ["30%", "-30%", "30%"],
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"></div>
          </motion.div>

          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-xl opacity-50"
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/60 via-emerald-500/30 to-transparent rounded-full"></div>
          </motion.div>
        </div>

        {/* Subtle pulsing glow around component */}
        <motion.div
          className="absolute -inset-1 rounded-2xl blur-2xl"
          animate={{
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/25 via-emerald-500/10 to-transparent rounded-2xl"></div>
        </motion.div>

        {/* Base glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
        
        <div className="relative bg-gradient-to-b from-zinc-900/95 to-black/95 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl p-6">
          {/* Tabs at top */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {[
                { id: "csv", label: "CSV Upload" },
                { id: "manual", label: "Manual" },
                { id: "bulk", label: "Bulk Paste" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                    activeTab === tab.id
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                      : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[120px] flex items-center">
            {/* CSV Upload */}
            {activeTab === "csv" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="flex flex-col md:flex-row gap-4 items-center">
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
                      className="flex items-center gap-4 p-5 border-2 border-dashed border-emerald-500/30 rounded-xl hover:border-emerald-500/50 transition-all cursor-pointer bg-black/20 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all flex-shrink-0">
                        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">
                          Drop CSV file or click to upload
                        </p>
                        <p className="text-sm text-gray-400">
                          Format: company_name, url
                        </p>
                      </div>
                    </label>
                  </div>

                  <a
                    href="/sample-companies.csv"
                    download
                    className="flex items-center gap-2 px-6 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Sample CSV
                  </a>
                </div>
              </motion.div>
            )}

            {/* Manual Entry */}
            {activeTab === "manual" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col md:flex-row gap-3"
              >
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name"
                  className="flex-1 px-5 py-4 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-5 py-4 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleManualSubmit}
                  disabled={isProcessing || !companyName || !url}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-black font-bold rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-emerald-500/50 transition-all whitespace-nowrap"
                >
                  {isProcessing ? "Processing..." : "Validate"}
                </motion.button>
              </motion.div>
            )}

            {/* Bulk Paste */}
            {activeTab === "bulk" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col md:flex-row gap-3"
              >
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Acme Corp, https://acme.com&#10;Tech Inc, https://techinc.io&#10;StartupXYZ, https://startupxyz.com"
                  rows={4}
                  className="flex-1 px-5 py-4 bg-black/50 border border-emerald-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 font-mono text-sm transition-all resize-none"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBulkSubmit}
                  disabled={isProcessing || !bulkText.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-black font-bold rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-emerald-500/50 transition-all whitespace-nowrap self-end"
                >
                  {isProcessing ? "Processing..." : "Validate All"}
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
