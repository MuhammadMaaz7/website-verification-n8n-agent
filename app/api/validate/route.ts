import { NextRequest, NextResponse } from "next/server";

// Mock API endpoint for testing without n8n
// Replace this with actual n8n webhook in production

export async function POST(request: NextRequest) {
  try {
    const { companyName, url } = await request.json();

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation logic
    const isReachable = Math.random() > 0.1;
    const hasRedirect = Math.random() > 0.7;
    const brandPresence = Math.floor(Math.random() * 40) + 60;
    const responseTime = Math.floor(Math.random() * 500) + 100;

    return NextResponse.json({
      isReachable,
      redirectUrl: hasRedirect ? `https://redirected-${companyName.toLowerCase().replace(/\s+/g, "")}.com` : undefined,
      brandPresence,
      responseTime,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    );
  }
}
