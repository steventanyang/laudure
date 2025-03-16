/**
 * Volume Utilities
 *
 * This module provides utility functions for processing and formatting dining volume data
 * for visualization in charts and graphs. It handles time-based aggregation of menu items
 * and categorizes them into appetizers, mains, and desserts.
 *
 * Key functions:
 * - getVolumeData: Processes reservation data into time-based volume counts by meal category
 * - getDetailedVolumeData: Creates detailed time-series data for each specific menu item
 *
 * The module supports:
 * - Time-slot based aggregation (30-minute intervals from 18:00 to 22:00)
 * - Special handling for Chef's Tasting Menu orders
 * - Proportional distribution of orders based on party size
 * - Color scheme application for consistent visualization
 */

import { DinersList } from "@/types/api";
import { menuCategories, colorSchemes } from "@/lib/utils";

// Process data for volume chart
export function getVolumeData(data: DinersList) {
  // Define time slots from 18:00 to 22:00 with 30-minute increments
  const timeSlots = [
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
  ];

  // Initialize counts for each meal type at each time slot
  const volumeData = timeSlots.map((time) => ({
    time,
    appetizers: 0,
    mains: 0,
    desserts: 0,
  }));

  // Count orders by time slot and meal type
  data.diners.forEach((diner) => {
    diner.reservations?.forEach((reservation) => {
      const timeIndex = timeSlots.indexOf(reservation.time);
      if (timeIndex !== -1) {
        reservation.orders.forEach((order) => {
          const item = order.item;

          // Skip Chef's Tasting Menu
          if (item === "Chef's Tasting Menu") return;

          // Categorize the meal
          // @ts-expect-error Type assertion is not needed here
          if (menuCategories.appetizers.includes(item)) {
            volumeData[timeIndex].appetizers += 1;
            // @ts-expect-error Type assertion is not needed here
          } else if (menuCategories.mains.includes(item)) {
            volumeData[timeIndex].mains += 1;
            // @ts-expect-error Type assertion is not needed here
          } else if (menuCategories.desserts.includes(item)) {
            volumeData[timeIndex].desserts += 1;
          }
        });
      }
    });
  });

  return volumeData;
}

// Process detailed data for volume chart
export function getDetailedVolumeData(data: DinersList) {
  // Define time slots from 18:00 to 22:00 with 30-minute increments
  const timeSlots = [
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
  ];

  // Initialize the result object
  const result = {
    timeSlots,
    appetizers: {} as Record<string, number[]>,
    mains: {} as Record<string, number[]>,
    desserts: {} as Record<string, number[]>,
    // Add colors matching the treemap
    colors: colorSchemes,
  };

  // Initialize counts for each menu item at each time slot
  menuCategories.appetizers.forEach((item) => {
    result.appetizers[item] = Array(timeSlots.length).fill(0);
  });

  menuCategories.mains.forEach((item) => {
    result.mains[item] = Array(timeSlots.length).fill(0);
  });

  menuCategories.desserts.forEach((item) => {
    result.desserts[item] = Array(timeSlots.length).fill(0);
  });

  // Add Chef's Tasting Menu to all categories
  result.appetizers["Chef's Tasting Menu"] = Array(timeSlots.length).fill(0);
  result.mains["Chef's Tasting Menu"] = Array(timeSlots.length).fill(0);
  result.desserts["Chef's Tasting Menu"] = Array(timeSlots.length).fill(0);

  // Process reservations and distribute orders evenly
  data.diners.forEach((diner) => {
    diner.reservations?.forEach((reservation) => {
      const timeIndex = timeSlots.indexOf(reservation.time);
      if (timeIndex !== -1) {
        const peopleCount = reservation.number_of_people;

        // Group orders by course type
        const appetizerOrders: string[] = [];
        const mainOrders: string[] = [];
        const dessertOrders: string[] = [];
        let hasTastingMenu = false;

        // Categorize each order
        reservation.orders.forEach((order) => {
          const item = order.item;

          // Handle Chef's Tasting Menu separately
          if (item === "Chef's Tasting Menu") {
            hasTastingMenu = true;
            return;
          }

          // @ts-expect-error Type assertion is not needed here
          if (menuCategories.appetizers.includes(item)) {
            appetizerOrders.push(item);
            // @ts-expect-error Type assertion is not needed here
          } else if (menuCategories.mains.includes(item)) {
            mainOrders.push(item);
            // @ts-expect-error Type assertion is not needed here
          } else if (menuCategories.desserts.includes(item)) {
            dessertOrders.push(item);
          }
        });

        // If there's a tasting menu, add it to all categories
        if (hasTastingMenu) {
          result.appetizers["Chef's Tasting Menu"][timeIndex] += peopleCount;
          result.mains["Chef's Tasting Menu"][timeIndex] += peopleCount;
          result.desserts["Chef's Tasting Menu"][timeIndex] += peopleCount;
        }

        // Distribute appetizers evenly
        if (appetizerOrders.length > 0) {
          // Calculate how many people per appetizer
          const peoplePerAppetizer = peopleCount / appetizerOrders.length;

          appetizerOrders.forEach((item) => {
            result.appetizers[item][timeIndex] += peoplePerAppetizer;
          });
        }

        // Distribute mains evenly
        if (mainOrders.length > 0) {
          // Calculate how many people per main
          const peoplePerMain = peopleCount / mainOrders.length;

          mainOrders.forEach((item) => {
            result.mains[item][timeIndex] += peoplePerMain;
          });
        }

        // Distribute desserts evenly
        if (dessertOrders.length > 0) {
          // Calculate how many people per dessert
          const peoplePerDessert = peopleCount / dessertOrders.length;

          dessertOrders.forEach((item) => {
            result.desserts[item][timeIndex] += peoplePerDessert;
          });
        }
      }
    });
  });

  // Format the data for the charts
  const formatChartData = (category: "appetizers" | "mains" | "desserts") => {
    return timeSlots.map((time, index) => {
      const dataPoint: Record<string, string | number> = { time };
      Object.keys(result[category]).forEach((item) => {
        // Round to 1 decimal place for cleaner display
        dataPoint[item] = Math.round(result[category][item][index] * 10) / 10;
      });
      return dataPoint;
    });
  };

  // Add iridescent color for Chef's Tasting Menu to all color schemes
  const iridescent = "url(#iridescent-gradient)";
  result.colors.appetizers.push(iridescent);
  result.colors.mains.push(iridescent);
  result.colors.desserts.push(iridescent);

  return {
    appetizersData: formatChartData("appetizers"),
    mainsData: formatChartData("mains"),
    dessertsData: formatChartData("desserts"),
    colors: result.colors,
  };
}
