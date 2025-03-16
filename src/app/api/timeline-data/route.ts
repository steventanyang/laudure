/**
 * Timeline Data API Route
 *
 * This API endpoint provides processed reservation data for the restaurant timeline visualization.
 * It loads the agent-augmented dining dataset and transforms it into a format optimized for
 * the timeline interface.
 *
 * Endpoint: GET /api/timeline-data
 *
 * Response:
 * - Array of ReservationDetail objects containing comprehensive information about each reservation
 *   including guest details, time, status, tags, dishes, and kitchen notes
 *
 * Error handling:
 * - Returns 500 status with error message if data processing fails
 */

import { NextResponse } from "next/server";
import {
  loadAgentAugmentedData,
  getReservationDetails,
} from "@/lib/timeline-utils";

export async function GET() {
  try {
    // Load agent-augmented data
    const data = await loadAgentAugmentedData();

    // Process reservation details
    const reservationDetails = getReservationDetails(data);

    // Return processed data
    return NextResponse.json(reservationDetails);
  } catch (error) {
    console.error("Error fetching reservation details:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservation details" },
      { status: 500 }
    );
  }
}
