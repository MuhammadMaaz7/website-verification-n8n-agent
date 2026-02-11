import { ValidationResult } from "@/components/ValidationDashboard";

export function exportToCSV(results: ValidationResult[]) {
  const headers = [
    "Company Name",
    "URL",
    "Status",
    "Reachable",
    "Redirect URL",
    "Brand Presence %",
    "Response Time (ms)",
    "Error"
  ];

  const rows = results.map(r => [
    r.companyName,
    r.url,
    r.status,
    r.isReachable ? "Yes" : "No",
    r.redirectUrl || "N/A",
    r.brandPresence?.toString() || "N/A",
    r.responseTime?.toString() || "N/A",
    r.error || "N/A"
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `validation-results-${Date.now()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function exportToJSON(results: ValidationResult[]) {
  const json = JSON.stringify(results, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `validation-results-${Date.now()}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
}
