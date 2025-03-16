import { NextResponse } from "next/server";
import {
  loadAgentAugmentedData,
  getReservationDetails,
} from "@/lib/kitchen-utils";

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
