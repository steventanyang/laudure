"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CourseType, CourseOption } from "@/types";
import { GiCupcake, GiMeal, GiChefToque } from "react-icons/gi";

interface DetailedVolumeData {
  appetizersData: Record<string, string | number>[];
  mainsData: Record<string, string | number>[];
  dessertsData: Record<string, string | number>[];
  colors: {
    appetizers: string[];
    mains: string[];
    desserts: string[];
  };
}

export default function Volume() {
  const [detailedData, setDetailedData] = useState<DetailedVolumeData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseType>("mains");

  // Course options with icons (same as Overview page)
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
        const response = await fetch("/api/volume-data");

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setDetailedData(data);
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
        <div className="text-xl">Loading volume data...</div>
      </div>
    );
  }

  // Error state
  if (error || !detailedData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">
          {error || "Failed to load volume data"}
        </div>
      </div>
    );
  }

  // Get current detailed data based on selected course
  const currentData =
    selectedCourse === "appetizers"
      ? detailedData.appetizersData
      : selectedCourse === "mains"
      ? detailedData.mainsData
      : detailedData.dessertsData;

  // Get current color scheme
  const currentColors = detailedData.colors[selectedCourse];

  // Get item names for the selected course
  const itemNames = Object.keys(currentData[0]).filter((key) => key !== "time");

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      {/* Main Chart Card */}
      <Card className="w-full max-w-5xl bg-black border-gray-800">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl font-bold text-white">
            {courseOptions.find((o) => o.id === selectedCourse)?.name} Orders by
            Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={currentData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#fff" }}
                  axisLine={{ stroke: "#444" }}
                  tickLine={{ stroke: "#444" }}
                />
                <YAxis
                  tick={{ fill: "#fff" }}
                  axisLine={{ stroke: "#444" }}
                  tickLine={{ stroke: "#444" }}
                />
                <Tooltip
                  formatter={(value, name) => [`${value} orders`, name]}
                  labelFormatter={(label) => `Time: ${label}`}
                  contentStyle={{
                    backgroundColor: "#222",
                    borderColor: "#444",
                  }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#fff" }}
                />
                {itemNames.map((item, index) => (
                  <Area
                    key={item}
                    type="monotone"
                    dataKey={item}
                    stackId="1"
                    stroke={currentColors[index % currentColors.length]}
                    fill={currentColors[index % currentColors.length]}
                    name={item}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Custom Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 mb-6 max-w-4xl">
        {itemNames.map((item, index) => (
          <div key={item} className="flex items-center mr-4 mb-2">
            <div
              className="w-4 h-4 mr-2"
              style={{
                backgroundColor: currentColors[index % currentColors.length],
              }}
            ></div>
            <span className="text-sm text-white">{item}</span>
          </div>
        ))}
      </div>

      {/* Course selection icons */}
      <div className="flex justify-center gap-12 mt-2">
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
