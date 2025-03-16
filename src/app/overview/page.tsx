"use client";

import { useState, useEffect } from "react";
import TreemapChart from "@/components/TreemapChart";
import SkeletonTreemap from "@/components/SkeletonTreemap";
import { CourseType, CourseOption, MealDataByCourse } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

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

  // Updated course options with larger SVGs
  const courseOptions: CourseOption[] = [
    {
      id: "appetizers",
      name: "Appetizers",
      titleIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 40 40"
          className="inline-block mr-2 mb-1"
        >
          <polygon
            points="20,5 38,35 2,35"
            fill="white"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      ),
      icon: (isSelected) => (
        <svg width="50" height="50" viewBox="0 0 40 40">
          <polygon
            points="20,5 38,35 2,35"
            fill={isSelected ? "white" : "#333"}
            stroke={isSelected ? "white" : "#333"}
            strokeWidth="2"
            className="transition-all duration-300"
          />
        </svg>
      ),
    },
    {
      id: "mains",
      name: "Mains",
      titleIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 30 30"
          className="inline-block mr-2 mb-1"
        >
          <rect
            x="3"
            y="3"
            width="24"
            height="24"
            fill="white"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      ),
      icon: (isSelected) => (
        <svg width="50" height="50" viewBox="0 0 30 30">
          <rect
            x="3"
            y="3"
            width="24"
            height="24"
            fill={isSelected ? "white" : "#333"}
            stroke={isSelected ? "white" : "#333"}
            strokeWidth="2"
            className="transition-all duration-300"
          />
        </svg>
      ),
    },
    {
      id: "desserts",
      name: "Desserts",
      titleIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 30 30"
          className="inline-block mr-2 mb-1"
        >
          <polygon
            points="15,2 28,11 23,28 7,28 2,11"
            fill="white"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      ),
      icon: (isSelected) => (
        <svg width="50" height="50" viewBox="0 0 30 30">
          <polygon
            points="15,2 28,11 23,28 7,28 2,11"
            fill={isSelected ? "white" : "#333"}
            stroke={isSelected ? "white" : "#333"}
            strokeWidth="2"
            className="transition-all duration-300"
          />
        </svg>
      ),
    },
  ];

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch("/api/menu-analytics");

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
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
