/**
 * Menu Utilities
 *
 * This module provides utility functions for processing and analyzing menu data
 * from the restaurant's dining dataset. It handles loading data from JSON files and
 * transforming it into formats suitable for menu analytics visualizations.
 *
 * Key functions:
 * - loadDinersData: Loads the augmented dining dataset
 * - getMenuAnalytics: Processes data to get menu item popularity counts
 * - addColorsToMenuAnalytics: Enhances analytics with consistent color schemes
 *
 * The module supports:
 * - Counting menu items with consideration for party size
 * - Special handling for Chef's Tasting Menu orders
 * - Categorization of items into appetizers, mains, and desserts
 * - Application of consistent color schemes for visualization
 */

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
  let chefsTastingMenuCount = 0;

  // Count occurrences of each menu item, accounting for party size
  data.diners.forEach((diner) => {
    diner.reservations?.forEach((reservation) => {
      // Get number of people (default to 1 if not specified)
      const numberOfPeople = reservation.number_of_people || 1;

      reservation.orders.forEach((order) => {
        const item = order.item;
        if (item === "Chef's Tasting Menu") {
          // Multiply by number of people
          chefsTastingMenuCount += numberOfPeople;
        } else {
          // Add number of people to the count instead of just 1
          itemCounts[item] = (itemCounts[item] || 0) + numberOfPeople;
        }
      });
    });
  });

  // Distribute Chef's Tasting Menu counts across all dishes
  if (chefsTastingMenuCount > 0) {
    // Add 0.2 to each dish for every person who ordered Chef's Tasting Menu
    const allMenuItems = [
      ...menuCategories.appetizers,
      ...menuCategories.mains,
      ...menuCategories.desserts,
    ];

    allMenuItems.forEach((item) => {
      if (itemCounts[item] !== undefined) {
        itemCounts[item] += chefsTastingMenuCount * 0.2;
      }
    });
  }

  // Organize counts by category and round up any decimal values
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
        count: Math.ceil(itemCounts[item]), // Round up decimal values
      });
    }
  });

  // Process main courses
  menuCategories.mains.forEach((item) => {
    if (itemCounts[item]) {
      result.mains.push({
        name: item,
        count: Math.ceil(itemCounts[item]), // Round up decimal values
      });
    }
  });

  // Process desserts
  menuCategories.desserts.forEach((item) => {
    if (itemCounts[item]) {
      result.desserts.push({
        name: item,
        count: Math.ceil(itemCounts[item]), // Round up decimal values
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
