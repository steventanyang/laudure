/**
 * Volume Data API Route
 *
 * This API endpoint provides processed dining volume data for time-based visualizations.
 * It loads the dining dataset and transforms it into a format optimized for volume charts
 * showing the distribution of orders across time slots.
 *
 * Endpoint: GET /api/volume-data
 *
 * Response:
 * - Detailed volume data object containing time-series data for each menu item
 *   organized by appetizers, mains, and desserts, with appropriate color schemes
 *
 * Error handling:
 * - Returns 500 status with error message if data processing fails
 */

import { NextResponse } from "next/server";
import { loadDinersData } from "@/lib/menu-utils";
import { getDetailedVolumeData } from "@/lib/volume-utils";

export async function GET() {
  try {
    // Load data
    const data = await loadDinersData();

    // Process detailed data for volume charts
    const detailedData = getDetailedVolumeData(data);

    // Return processed data
    return NextResponse.json(detailedData);
  } catch (error) {
    console.error("Error fetching volume data:", error);
    return NextResponse.json(
      { error: "Failed to fetch volume data" },
      { status: 500 }
    );
  }
}
