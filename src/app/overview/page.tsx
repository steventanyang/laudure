"use client";

import { useState, useEffect } from "react";
import TreemapChart from "@/components/TreemapChart";
import { CourseType, CourseOption, MealDataByCourse } from "@/types";

// Icons for course selection
import { GiCupcake, GiMeal, GiChefToque } from "react-icons/gi";

export default function Overview() {
  // State for meal data
  const [mealData, setMealData] = useState<MealDataByCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State to track the selected course
  const [selectedCourse, setSelectedCourse] = useState<CourseType>("mains");

  // Course options with icons
  const courseOptions: CourseOption[] = [
    { id: "appetizers", name: "Appetizers", icon: <GiChefToque size={32} /> },
    { id: "mains", name: "Main Courses", icon: <GiMeal size={32} /> },
    { id: "desserts", name: "Desserts", icon: <GiCupcake size={32} /> },
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
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading meal data...</div>
      </div>
    );
  }

  // Error state
  if (error || !mealData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">
          {error || "Failed to load meal data"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-8">Meal Orders Overview</h1>

      <div className="w-full max-w-5xl mb-10">
        <TreemapChart data={mealData[selectedCourse]} />
      </div>

      {/* Course selection icons */}
      <div className="flex justify-center gap-12 mt-4">
        {courseOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedCourse(option.id)}
            className={`flex flex-col items-center p-4 rounded-lg transition-all ${
              selectedCourse === option.id
                ? "bg-gray-800 text-white scale-110"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <div className="mb-2">{option.icon}</div>
            <span className="font-bold">{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
