/**
 * Overview Page
 *
 * This page provides a high-level visualization of menu item popularity using
 * a treemap chart. It allows kitchen staff and management to quickly identify
 * the most frequently ordered items within each course category.
 *
 * Features:
 * - Interactive treemap visualization showing relative popularity of menu items
 * - Course selection (appetizers, mains, desserts) with smooth transitions
 * - Color-coded representation with proportional sizing based on order count
 * - Animated transitions between different course views
 * - Client-side caching to improve navigation performance
 *
 * Components:
 * - TreemapChart: Custom component for rendering the hierarchical data
 * - SkeletonTreemap: Loading state placeholder
 * - Course selection buttons with custom icons from CourseOptions
 * - Framer Motion animations for smooth transitions
 *
 * Data Flow:
 * 1. Checks localStorage cache for existing data
 * 2. Fetches menu analytics data from /api/menu-analytics if cache miss or expired
 * 3. Displays data for the selected course category
 * 4. Provides interactive elements for switching between courses
 * 5. Animates transitions for a polished user experience
 */

"use client";

import { useState, useEffect } from "react";
import TreemapChart from "@/components/TreemapChart";
import SkeletonTreemap from "@/components/SkeletonTreemap";
import { CourseType, MealDataByCourse } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
// Import the centralized course options
import { courseOptions } from "@/components/CourseOptions";
// Import cache utilities
import { getCachedData, setCachedData, CACHE_KEYS } from "@/lib/cache-utils";

export default function Overview() {
  // State for meal data
  const [mealData, setMealData] = useState<MealDataByCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State to track the selected course
  const [selectedCourse, setSelectedCourse] = useState<CourseType>("mains");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle course selection with smooth transition - faster timing
  const handleCourseChange = (courseId: CourseType) => {
    if (courseId === selectedCourse) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCourse(courseId);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150); // Reduced from 300ms
    }, 100); // Reduced from 200ms
  };

  // Fetch data from API with caching
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Check cache first
        const cachedData = getCachedData<MealDataByCourse>(
          CACHE_KEYS.MENU_ANALYTICS
        );

        if (cachedData) {
          console.log("Using cached menu analytics data");
          setMealData(cachedData);
          setLoading(false);
          return;
        }

        // Cache miss - fetch from API
        console.log("Fetching fresh menu analytics data");
        const response = await fetch("/api/menu-analytics");

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        // Cache the data
        setCachedData(CACHE_KEYS.MENU_ANALYTICS, data);

        setMealData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        // Add a slight delay to show the loading animation
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    }

    fetchData();
  }, []);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">
          {error || "Failed to load meal data"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-8 pt-30">
      <motion.h1
        className="text-2xl font-bold mb-8"
        key={`title-${selectedCourse}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }} // Reduced from 0.5s
      >
        {
          courseOptions.find((option) => option.id === selectedCourse)
            ?.titleIcon
        }
        {courseOptions.find((option) => option.id === selectedCourse)?.name}
      </motion.h1>

      <div className="w-full max-w-5xl mb-10 relative h-[500px]">
        {loading ? (
          <SkeletonTreemap />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`chart-${selectedCourse}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} // Reduced from 0.4s
              className="absolute inset-0"
              style={{ pointerEvents: isTransitioning ? "none" : "auto" }}
            >
              <TreemapChart data={mealData![selectedCourse]} />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Course selection icons - hidden while loading */}
      {!loading && (
        <div className="flex justify-center gap-16 mt-4">
          {courseOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleCourseChange(option.id)}
              className="flex flex-col items-center transition-all"
              disabled={isTransitioning}
            >
              <motion.div
                className={`p-5 rounded-md ${
                  selectedCourse === option.id
                    ? "scale-110 filter drop-shadow-glow"
                    : "hover:scale-105"
                } transition-all duration-200`} // Reduced from 300ms
                whileHover={{
                  scale: selectedCourse === option.id ? 1.1 : 1.05,
                  transition: { duration: 0.15 }, // Added faster hover transition
                }}
                whileTap={{
                  scale: 0.95,
                  transition: { duration: 0.1 }, // Added faster tap transition
                }}
              >
                {option.icon(selectedCourse === option.id)}
              </motion.div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
