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
