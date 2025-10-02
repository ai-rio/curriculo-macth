import { NextRequest, NextResponse } from "next/server"

import { canCreateOptimization, getUserSubscription, ensureUserSubscription } from "@/services/subscription-service"

/**
 * Get current user subscription status
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from auth header or session
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // TODO: Implement proper JWT token verification
    // For now, we'll extract user_id from token
    let userId
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userId = payload.user_id
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    // Get user subscription data
    const subscriptionData = await getUserSubscription(userId)

    return NextResponse.json({
      success: true,
      data: subscriptionData,
    })

  } catch (error) {
    console.error("Failed to get subscription:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch subscription data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * Check if user can create optimization
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Extract user_id from token
    let userId
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userId = payload.user_id
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    // Check if user can create optimization
    const canCreate = await canCreateOptimization(userId)

    return NextResponse.json({
      success: true,
      data: canCreate,
    })

  } catch (error) {
    console.error("Failed to check optimization eligibility:", error)
    return NextResponse.json(
      {
        error: "Failed to check eligibility",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}