/**
 * Menu Analytics API Route
 *
 * This API endpoint provides processed menu analytics data for visualizing menu item popularity.
 * It loads the dining dataset and transforms it into a format optimized for menu analytics
 * visualizations.
 *
 * Endpoint: GET /api/menu-analytics
 *
 * Response:
 * - MenuAnalytics object containing categorized menu items with counts and colors
 *   organized by appetizers, mains, and desserts
 *
 * Error handling:
 * - Returns 500 status with error message if data processing fails
 */

import { NextResponse } from "next/server";
import {
  loadDinersData,
  getMenuAnalytics,
  addColorsToMenuAnalytics,
} from "@/lib/menu-utils";

export async function GET() {
  try {
    // Load data
    const data = await loadDinersData();

    // Process data
    const menuAnalytics = getMenuAnalytics(data);

    // Add colors
    const coloredAnalytics = addColorsToMenuAnalytics(menuAnalytics);

    // Return processed data
    return NextResponse.json(coloredAnalytics);
  } catch (error) {
    console.error("Error fetching menu analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu analytics" },
      { status: 500 }
    );
  }
}
