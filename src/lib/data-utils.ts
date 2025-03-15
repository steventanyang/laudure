import { DinersList, MenuAnalytics } from "@/types/api";
import path from "path";
import fs from "fs";

// Categories for menu
// TODO: replace with actual categories
const menuCategories = {
  appetizers: [
    "Escargots",
    "Foie Gras",
    "Salmon Tartare",
    "Lobster Bisque",
    "Salade Niçoise",
  ],
  mains: [
    "Beef Bourguignon",
    "Coq au Vin",
    "Duck Confit",
    "Rabbit Roulade",
    "Salmon en Papillote",
  ],
  desserts: [
    "Chocolate Soufflé",
    "Crème Brûlée",
    "Tarte Tatin",
    "Profiteroles",
    "Mousse au Chocolat",
  ],
};

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
  const colorSchemes = {
    appetizers: ["#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800"],
    mains: ["#bac94a", "#e0b0b0", "#85b1bd", "#ce92ce", "#cbba89", "#a1887f"],
    desserts: ["#795548", "#ffca28", "#ff7043", "#d7ccc8", "#6d4c41"],
  };

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
          if (menuCategories.appetizers.includes(item)) {
            volumeData[timeIndex].appetizers += 1;
          } else if (menuCategories.mains.includes(item)) {
            volumeData[timeIndex].mains += 1;
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
    colors: {
      appetizers: ["#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800"],
      mains: ["#bac94a", "#e0b0b0", "#85b1bd", "#ce92ce", "#cbba89", "#a1887f"],
      desserts: ["#795548", "#ffca28", "#ff7043", "#d7ccc8", "#6d4c41"],
    },
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

        // Categorize each order
        reservation.orders.forEach((order) => {
          const item = order.item;

          // Skip Chef's Tasting Menu
          if (item === "Chef's Tasting Menu") return;

          if (menuCategories.appetizers.includes(item)) {
            appetizerOrders.push(item);
          } else if (menuCategories.mains.includes(item)) {
            mainOrders.push(item);
          } else if (menuCategories.desserts.includes(item)) {
            dessertOrders.push(item);
          }
        });

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

  return {
    appetizersData: formatChartData("appetizers"),
    mainsData: formatChartData("mains"),
    dessertsData: formatChartData("desserts"),
    colors: result.colors,
  };
}
