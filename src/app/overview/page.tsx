"use client";

import { useState } from "react";
import TreemapChart from "@/components/TreemapChart";
import { CourseType, CourseOption, MealDataByCourse } from "@/types";

// Icons for course selection
import { GiCupcake, GiMeal, GiChefToque } from "react-icons/gi";

export default function Overview() {
  // Define meal data for each course
  const mealData: MealDataByCourse = {
    appetizers: [
      { name: "Escargots", count: 12, color: "#8bc34a" },
      { name: "Foie Gras", count: 18, color: "#cddc39" },
      { name: "Salmon Tartare", count: 14, color: "#ffeb3b" },
      { name: "Lobster Bisque", count: 9, color: "#ffc107" },
      { name: "Salade Niçoise", count: 7, color: "#ff9800" },
    ],
    mains: [
      { name: "Salmon en Papillote", count: 16, color: "#bac94a" },
      { name: "Duck Confit", count: 13, color: "#e0b0b0" },
      { name: "Boeuf Bourguignon", count: 20, color: "#85b1bd" },
      { name: "Rabbit Roulade", count: 10, color: "#ce92ce" },
      { name: "Coq au Vin", count: 5, color: "#cbba89" },
    ],
    desserts: [
      { name: "Chocolate Soufflé", count: 22, color: "#795548" },
      { name: "Crème Brûlée", count: 25, color: "#ffca28" },
      { name: "Tarte Tatin", count: 15, color: "#ff7043" },
      { name: "Profiteroles", count: 11, color: "#d7ccc8" },
      { name: "Mousse au Chocolat", count: 18, color: "#6d4c41" },
    ],
  };

  // State to track the selected course
  const [selectedCourse, setSelectedCourse] = useState<CourseType>("mains");

  // Course options with icons
  const courseOptions: CourseOption[] = [
    { id: "appetizers", name: "Appetizers", icon: <GiChefToque size={32} /> },
    { id: "mains", name: "Main Courses", icon: <GiMeal size={32} /> },
    { id: "desserts", name: "Desserts", icon: <GiCupcake size={32} /> },
  ];

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
