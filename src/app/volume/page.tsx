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
import SkeletonAreaChart from "@/components/SkeletonAreaChart";
import { CourseOption, DetailedVolumeData } from "@/types";

export default function Volume() {
  const [detailedData, setDetailedData] = useState<DetailedVolumeData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] =
    useState<CourseOption["id"]>("mains");

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
          {error || "Failed to load volume data"}
        </div>
      </div>
    );
  }

  // If loading, show skeleton
  if (loading) {
    return (
      <div className="pt-24 pb-8 px-8">
        <div className="flex flex-col items-center">
          <SkeletonAreaChart />
        </div>
      </div>
    );
  }

  // Get current detailed data based on selected course
  const currentData =
    selectedCourse === "appetizers"
      ? detailedData!.appetizersData
      : selectedCourse === "mains"
      ? detailedData!.mainsData
      : detailedData!.dessertsData;

  // Get current color scheme
  const currentColors = detailedData!.colors[selectedCourse];

  // Get item names for the selected course
  const itemNames = Object.keys(currentData[0]).filter((key) => key !== "time");

  return (
    <div className="pt-24 pb-8 px-8">
      <div className="flex flex-col items-center">
        {/* Main Chart Card */}
        <Card className="w-full max-w-5xl bg-black border-0">
          <CardHeader className="flex flex-col items-center">
            <CardTitle className="text-2xl font-bold text-white">
              {courseOptions.find((o) => o.id === selectedCourse)?.titleIcon}
              {courseOptions.find((o) => o.id === selectedCourse)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonAreaChart />
            ) : (
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={currentData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 6"
                      stroke="#222222"
                      strokeOpacity={0.3}
                    />
                    <XAxis
                      dataKey="time"
                      tick={{
                        fill: "#aaa",
                        fontSize: 18,
                        fontWeight: 500,
                        dy: 10,
                      }}
                      axisLine={{ stroke: "#444" }}
                      tickLine={{ stroke: "#444" }}
                    />
                    <YAxis
                      tick={{ fill: "#aaa" }}
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
            )}
          </CardContent>
        </Card>

        {/* Custom Legend - only shown when not loading */}
        {!loading && (
          <div className="flex flex-wrap justify-center gap-4 mt-2 mb-6 max-w-4xl">
            {itemNames.map((item, index) => (
              <div key={item} className="flex items-center mr-4 mb-2">
                <div
                  className="w-5 h-5 mr-2"
                  style={{
                    backgroundColor:
                      currentColors[index % currentColors.length],
                  }}
                ></div>
                <span className="text-sm text-gray-400">{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Geometric shape course selection - only shown when not loading */}
        {!loading && (
          <div className="flex justify-center gap-16 mt-6">
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
    </div>
  );
}
