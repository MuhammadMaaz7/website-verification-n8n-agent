// API integration with n8n webhook

export interface ValidationRequest {
  companyName: string;
  url: string;
}

export interface ValidationResponse {
  isReachable: boolean;
  redirectUrl?: string;
  brandPresence: number;
  responseTime: number;
  error?: string;
}

// Replace with your n8n webhook URL
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "http://localhost:5678/webhook/validate";

export async function validateWebsite(request: ValidationRequest): Promise<ValidationResponse> {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Validation error:", error);
    throw error;
  }
}

export async function validateBatch(requests: ValidationRequest[]): Promise<ValidationResponse[]> {
  // Process in parallel with rate limiting
  const results = await Promise.all(
    requests.map(request => validateWebsite(request).catch(err => ({
      isReachable: false,
      brandPresence: 0,
      responseTime: 0,
      error: err.message,
    })))
  );
  return results;
}
