import { NextRequest, NextResponse } from "next/server";

// Mock API endpoint for testing without n8n
// This simulates the n8n workflow response format

export async function POST(request: NextRequest) {
  try {
    const { companyName, url } = await request.json();

    // Validate input
    if (!companyName || !url) {
      return NextResponse.json(
        { error: "Missing required fields: companyName and url" },
        { status: 400 }
      );
    }

    // Simulate processing delay (realistic timing)
    const processingTime = Math.floor(Math.random() * 1500) + 500;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Mock validation logic with more realistic behavior
    const isReachable = Math.random() > 0.15; // 85% success rate
    const hasRedirect = Math.random() > 0.6; // 40% redirect rate
    const brandPresence = isReachable 
      ? Math.floor(Math.random() * 40) + 60  // 60-100 if reachable
      : 0; // 0 if not reachable
    const responseTime = Math.floor(Math.random() * 500) + 100;

    // Simulate different scenarios
    if (!isReachable) {
      return NextResponse.json({
        isReachable: false,
        brandPresence: 0,
        responseTime: responseTime,
        error: "Website is not reachable or timed out",
      });
    }

    // Success response
    return NextResponse.json({
      isReachable: true,
      redirectUrl: hasRedirect 
        ? `https://www.${url.replace(/^https?:\/\/(www\.)?/, "")}` 
        : undefined,
      brandPresence,
      responseTime,
      error: null,
    });

  } catch (error) {
    console.error("Mock API error:", error);
    return NextResponse.json(
      { 
        isReachable: false,
        brandPresence: 0,
        responseTime: 0,
        error: error instanceof Error ? error.message : "Validation failed" 
      },
      { status: 500 }
    );
  }
}
