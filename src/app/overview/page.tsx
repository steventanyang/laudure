"use client";

import { useState, useEffect } from "react";
import TreemapChart from "@/components/TreemapChart";
import SkeletonTreemap from "@/components/SkeletonTreemap";
import { CourseType, CourseOption, MealDataByCourse } from "@/types";

export default function Overview() {
  // State for meal data
  const [mealData, setMealData] = useState<MealDataByCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State to track the selected course
  const [selectedCourse, setSelectedCourse] = useState<CourseType>("mains");

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
      name: "Main Courses",
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
      <h1 className="text-2xl font-bold mb-8">
        {
          courseOptions.find((option) => option.id === selectedCourse)
            ?.titleIcon
        }
        {courseOptions.find((option) => option.id === selectedCourse)?.name}
      </h1>

      <div className="w-full max-w-5xl mb-10">
        {loading ? (
          <SkeletonTreemap />
        ) : (
          <TreemapChart data={mealData![selectedCourse]} />
        )}
      </div>

      {/* Course selection icons - hidden while loading */}
      {!loading && (
        <div className="flex justify-center gap-16 mt-4">
          {courseOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedCourse(option.id)}
              className="flex flex-col items-center transition-all"
            >
              <div
                className={`p-5 rounded-md ${
                  selectedCourse === option.id
                    ? "scale-110 filter drop-shadow-glow"
                    : "hover:scale-105"
                } transition-all duration-300`}
              >
                {option.icon(selectedCourse === option.id)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
