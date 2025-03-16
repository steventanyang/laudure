import { DinersList, MenuAnalytics } from "@/types/api";
import path from "path";
import fs from "fs";
import { menuCategories, colorSchemes } from "@/lib/utils";

// Load data from JSON file
export async function loadDinersData(): Promise<DinersList> {
  const filePath = path.join(
    process.cwd(),
    "data",
    "augmented-fine-dining-dataset.json"
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents) as DinersList;
}

// Process data to get menu item counts
export function getMenuAnalytics(data: DinersList): MenuAnalytics {
  const itemCounts: Record<string, number> = {};

  // Count occurrences of each menu item
  data.diners.forEach((diner) => {
    diner.reservations?.forEach((reservation) => {
      reservation.orders.forEach((order) => {
        const item = order.item;
        if (item !== "Chef's Tasting Menu") {
          itemCounts[item] = (itemCounts[item] || 0) + 1;
        }
      });
    });
  });

  // Organize counts by category
  const result: MenuAnalytics = {
    appetizers: [],
    mains: [],
    desserts: [],
  };

  // Process appetizers
  menuCategories.appetizers.forEach((item) => {
    if (itemCounts[item]) {
      result.appetizers.push({
        name: item,
        count: itemCounts[item],
      });
    }
  });

  // Process main courses
  menuCategories.mains.forEach((item) => {
    if (itemCounts[item]) {
      result.mains.push({
        name: item,
        count: itemCounts[item],
      });
    }
  });

  // Process desserts
  menuCategories.desserts.forEach((item) => {
    if (itemCounts[item]) {
      result.desserts.push({
        name: item,
        count: itemCounts[item],
      });
    }
  });

  return result;
}

// Add colors to menu analytics
export function addColorsToMenuAnalytics(
  analytics: MenuAnalytics
): MenuAnalytics {
  const result = { ...analytics };

  // Add colors to appetizers
  result.appetizers = result.appetizers.map((item, index) => ({
    ...item,
    color: colorSchemes.appetizers[index % colorSchemes.appetizers.length],
  }));

  // Add colors to mains
  result.mains = result.mains.map((item, index) => ({
    ...item,
    color: colorSchemes.mains[index % colorSchemes.mains.length],
  }));

  // Add colors to desserts
  result.desserts = result.desserts.map((item, index) => ({
    ...item,
    color: colorSchemes.desserts[index % colorSchemes.desserts.length],
  }));

  return result;
} 