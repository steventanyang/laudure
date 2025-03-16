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
import { DetailedVolumeData, CourseOption } from "@/types";
// Import the centralized course options
import { courseOptions } from "@/components/CourseOptions";

export default function Volume() {
  const [detailedData, setDetailedData] = useState<DetailedVolumeData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] =
    useState<CourseOption["id"]>("mains");
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null);

  // Removed duplicated courseOptions array - now imported from centralized component

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
  const currentColors =
    detailedData?.colors[selectedCourse as keyof typeof detailedData.colors] ||
    [];

  // Get item names for the selected course - fix type error by filtering out non-string keys
  const itemNames = Object.keys(currentData[0]).filter(
    (key) => key !== "time" && typeof currentData[0][key] === "number"
  );

  // Get the current title text based on highlighted item or selected course
  const getTitleText = () => {
    if (highlightedItem) {
      return highlightedItem;
    }
    return courseOptions.find((o) => o.id === selectedCourse)?.name;
  };

  // Handle smooth transitions for highlighting
  const handleMouseEnter = (item: string) => {
    setHighlightedItem(item);
  };

  const handleMouseLeave = () => {
    setHighlightedItem(null);
  };

  return (
    <div className="pt-24 pb-8 px-8">
      <div className="flex flex-col items-center">
        {/* Main Chart Card */}
        <Card className="w-full max-w-5xl bg-black border-0">
          <CardHeader className="flex flex-col items-center">
            <CardTitle className="text-2xl font-bold text-white transition-all duration-500">
              {courseOptions.find((o) => o.id === selectedCourse)?.titleIcon}
              {getTitleText()}
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
                    <defs>
                      {/* Iridescent gradient for Chef's Tasting Menu */}
                      <linearGradient
                        id="iridescent-gradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#8a9ec7" />
                        <stop offset="20%" stopColor="#c79ec0" />
                        <stop offset="40%" stopColor="#9ec7a8" />
                        <stop offset="60%" stopColor="#c7b89e" />
                        <stop offset="80%" stopColor="#9eaec7" />
                        <stop offset="100%" stopColor="#c79e9e" />
                      </linearGradient>

                      {/* Create gradient definitions for each color with brighter edges */}
                      {itemNames.map((item, index) => {
                        if (item === "Chef's Tasting Menu") return null;

                        const baseColor =
                          currentColors[index % currentColors.length];
                        // Create a slightly brighter version for the edges
                        const brighterColor = baseColor.replace(
                          /rgba?\((\d+), (\d+), (\d+)(?:, [\d.]+)?\)/,
                          (match: string, r: string, g: string, b: string) => {
                            const brighterR = Math.min(255, parseInt(r) + 40);
                            const brighterG = Math.min(255, parseInt(g) + 40);
                            const brighterB = Math.min(255, parseInt(b) + 40);
                            return `rgb(${brighterR}, ${brighterG}, ${brighterB})`;
                          }
                        );

                        return (
                          <linearGradient
                            key={`gradient-${item}`}
                            id={`gradient-${index}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={brighterColor}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="5%"
                              stopColor={baseColor}
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="95%"
                              stopColor={baseColor}
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="100%"
                              stopColor={brighterColor}
                              stopOpacity={0.8}
                            />
                          </linearGradient>
                        );
                      })}
                    </defs>
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
                    {itemNames.map((item, index) => {
                      const isHighlighted = highlightedItem === item;
                      const isDimmed =
                        highlightedItem !== null && !isHighlighted;

                      // Use the gradient for regular items, iridescent for Chef's Tasting Menu
                      const fillColor =
                        item === "Chef's Tasting Menu"
                          ? "url(#iridescent-gradient)"
                          : `url(#gradient-${index})`;

                      // Use solid colors for strokes
                      const strokeColor =
                        item === "Chef's Tasting Menu"
                          ? "#fff"
                          : currentColors[index % currentColors.length];

                      return (
                        <Area
                          key={item}
                          type="monotone"
                          dataKey={item as string}
                          stackId="1"
                          stroke={strokeColor}
                          fill={fillColor}
                          name={item}
                          fillOpacity={isDimmed ? 0.1 : 0.8}
                          strokeOpacity={isDimmed ? 0.2 : 1}
                          strokeWidth={isHighlighted ? 2 : 1}
                          className="transition-all duration-500"
                        />
                      );
                    })}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hover-based Legend - only shown when not loading */}
        {!loading && (
          <div className="mt-6 mb-2 relative">
            {/* Color squares row */}
            <div
              className="flex justify-center gap-3"
              onMouseLeave={handleMouseLeave}
            >
              {itemNames.map((item, index) => {
                const baseColor =
                  item === "Chef's Tasting Menu"
                    ? "linear-gradient(135deg, #8a9ec7, #c79ec0, #9ec7a8, #c7b89e, #9eaec7, #c79e9e)"
                    : currentColors[index % currentColors.length];

                return (
                  <div
                    key={item}
                    className="group relative"
                    onMouseEnter={() => handleMouseEnter(item)}
                  >
                    <div
                      className={`w-8 h-8 rounded-sm cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-glow ${
                        highlightedItem === item ? "scale-110 shadow-glow" : ""
                      }`}
                      style={{
                        background: baseColor,
                        opacity: 0.8,
                        border:
                          item === "Chef's Tasting Menu"
                            ? "1px solid rgba(255,255,255,0.5)"
                            : `1px solid ${baseColor}`,
                      }}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Geometric shape course selection - only shown when not loading */}
        {!loading && (
          <div className="flex justify-center gap-16 mt-8">
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
