/**
 * Utility Functions
 *
 * This module provides common utility functions and constants used throughout the application.
 * It includes class name merging utilities, menu category definitions, and color schemes
 * for consistent visualization.
 *
 * Key functions:
 * - cn: Merges class names using clsx and tailwind-merge
 * - getDishCategoryAndColor: Determines the category and color for a given dish
 *
 * Constants:
 * - menuCategories: Defines all menu items by category (appetizers, mains, desserts)
 * - colorSchemes: Provides consistent color palettes for each menu category
 *
 * These utilities ensure consistent styling, categorization, and visualization
 * across the application.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Menu categories and color schemes for consistent use across the app
export const menuCategories = {
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
} as const;

// Type for menu categories
export type MenuCategory = keyof typeof menuCategories;

// Color schemes for each category
export const colorSchemes: Record<MenuCategory, string[]> = {
  appetizers: ["#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800"],
  mains: ["#bac94a", "#e0b0b0", "#85b1bd", "#ce92ce", "#cbba89", "#a1887f"],
  desserts: ["#795548", "#ffca28", "#ff7043", "#d7ccc8", "#6d4c41"],
};

// Helper function to get dish category and color
export function getDishCategoryAndColor(dish: string) {
  // Default values
  let category: MenuCategory | "other" = "other";
  let colorIndex = 0;

  // Check each category for the dish
  (Object.keys(menuCategories) as MenuCategory[]).forEach((cat) => {
    // Type assertion to help TypeScript understand this is safe
    const dishes = menuCategories[cat] as readonly string[];
    const index = dishes.indexOf(dish);
    if (index !== -1) {
      category = cat;
      colorIndex = index;
    }
  });

  // Get color based on category and index
  const color =
    category !== "other"
      ? colorSchemes[category as MenuCategory][
          colorIndex % colorSchemes[category as MenuCategory].length
        ]
      : "#6d4c41";

  return { category, color };
}
