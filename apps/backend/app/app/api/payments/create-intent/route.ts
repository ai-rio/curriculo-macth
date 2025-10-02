import { NextRequest, NextResponse } from "next/server"

import { createPaymentIntent, getOrCreateCustomer } from "@/libs/stripe/stripe-admin"
import { incrementUsage } from "@/services/subscription-service"

/**
 * Create payment intent for one-time purchase
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

    const { tier, price, currency, metadata } = body

    if (!tier || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: tier, price" },
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

    // For lifetime plans, create a payment intent
    const { customer, created } = await getOrCreateCustomer({
      email: userEmail || "",
      userId,
      metadata: {
        tier,
        source: "resume-matcher-web",
      },
    })

    const { clientSecret, paymentIntentId } = await createPaymentIntent({
      amount: price,
      currency: currency || "USD",
      customerId: customer.id,
      metadata: {
        user_id: userId,
        tier,
        ...metadata,
      },
    })

    // Increment usage for pro users
    if (tier !== "free") {
      await incrementUsage(userId, false)
    }

    return NextResponse.json({
      success: true,
      data: {
        clientSecret,
        paymentIntentId,
        customerId: customer.id,
      },
    })

  } catch (error) {
    console.error("Failed to create payment intent:", error)
    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}