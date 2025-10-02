import { NextRequest, NextResponse } from "next/server"

import { createCheckoutSession, getOrCreateCustomer, upgradeToPro } from "@/services/subscription-service"

/**
 * Create Stripe checkout session for subscription
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
    const body = await request.json()

    // Extract user info from token
    let userId, userEmail
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userId = payload.user_id
      userEmail = payload.email
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    const { tier, successUrl, cancelUrl, metadata } = body

    if (!tier || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Missing required fields: tier, successUrl, cancelUrl" },
        { status: 400 }
      )
    }

    // Validate tier
    const validTiers = ["pro_lifetime", "pro_monthly"]
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const { customer, created } = await getOrCreateCustomer({
      email: userEmail || "",
      userId,
      metadata: {
        tier,
        source: "resume-matcher-web",
        ...metadata,
      },
    })

    // Get Stripe price ID for the tier
    const stripePriceId = getStripePriceId(tier)
    if (!stripePriceId) {
      return NextResponse.json(
        { error: "Stripe price not configured for this tier" },
        { status: 400 }
      )
    }

    // Create checkout session
    const { sessionId, url } = await createCheckoutSession({
      customerId: customer.id,
      priceId: stripePriceId,
      successUrl,
      cancelUrl,
      mode: tier === "lifetime" ? "payment" : "subscription",
      metadata: {
        user_id: userId,
        tier,
        ...metadata,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        checkoutUrl: url,
      },
    })

  } catch (error) {
    console.error("Failed to create checkout session:", error)
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Helper function to get Stripe price ID for a tier
function getStripePriceId(tier: string): string | null {
  // TODO: Replace with actual price IDs from your Stripe dashboard
  const priceIds = {
    pro_lifetime: process.env.STRIPE_PRICE_PRO_LIFETIME,
    pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  }

  return priceIds[tier as keyof typeof priceIds] || null
}