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