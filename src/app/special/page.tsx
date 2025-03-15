"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FaHeart, FaStar } from "react-icons/fa";
import SkeletonTimeline from "@/components/SkeletonTimeline";

// Enhanced sample data for special requests up to 22:00
const sampleSpecialRequests = [
  // 18:00 - Left side
  {
    id: 1,
    time: "18:00",
    people: 3,
    status: "urgent",
    isVIP: true,
    isCelebration: true,
  },
  // 18:30 - Right side
  {
    id: 2,
    time: "18:30",
    people: 3,
    status: "urgent",
    isVIP: false,
    isCelebration: false,
  },
  {
    id: 3,
    time: "18:30",
    people: 3,
    status: "attention",
    isVIP: false,
    isCelebration: false,
  },
  {
    id: 4,
    time: "18:30",
    people: 3,
    status: "normal",
    isVIP: false,
    isCelebration: false,
  },
  // 19:00 - Left side
  {
    id: 5,
    time: "19:00",
    people: 8,
    status: "normal",
    isVIP: false,
    isCelebration: false,
  },
  // 19:30 - Right side
  {
    id: 6,
    time: "19:30",
    people: 5,
    status: "normal",
    isVIP: false,
    isCelebration: false,
  },
  {
    id: 7,
    time: "19:30",
    people: 2,
    status: "normal",
    isVIP: false,
    isCelebration: false,
  },
  // 20:00 - Left side
  {
    id: 8,
    time: "20:00",
    people: 4,
    status: "urgent",
    isVIP: true,
    isCelebration: false,
  },
  {
    id: 9,
    time: "20:00",
    people: 6,
    status: "attention",
    isVIP: false,
    isCelebration: true,
  },
  // 20:30 - Right side
  {
    id: 10,
    time: "20:30",
    people: 2,
    status: "normal",
    isVIP: false,
    isCelebration: false,
  },
  // 21:00 - Left side
  {
    id: 11,
    time: "21:00",
    people: 7,
    status: "attention",
    isVIP: false,
    isCelebration: true,
  },
  // 21:30 - Right side
  {
    id: 12,
    time: "21:30",
    people: 4,
    status: "normal",
    isVIP: false,
    isCelebration: false,
  },
  // 22:00 - Left side
  {
    id: 13,
    time: "22:00",
    people: 2,
    status: "urgent",
    isVIP: true,
    isCelebration: false,
  },
];

// Status color mapping - more matte/subdued colors
const statusColors = {
  urgent: "bg-red-600/70",
  attention: "bg-amber-600/70",
  normal: "bg-green-600/70",
};

// Timeline component
export default function Special() {
  const [specialRequests] = useState(sampleSpecialRequests);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">
          {error || "Failed to load special requests"}
        </div>
      </div>
    );
  }

  // Group requests by time
  const timeGroups = specialRequests.reduce((groups, request) => {
    if (!groups[request.time]) {
      groups[request.time] = [];
    }
    groups[request.time].push(request);
    return groups;
  }, {} as Record<string, typeof specialRequests>);

  // Get unique times in order
  const times = Object.keys(timeGroups).sort();

  // Helper function to determine if a time should be on the left or right
  const isLeftSide = (time: string) => {
    // Times ending in :00 are on the left, times ending in :30 are on the right
    return time.endsWith(":00");
  };

  return (
    <div className="pt-20 pb-8 px-8">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-8">Special Requests Timeline</h1>

        {loading ? (
          <SkeletonTimeline />
        ) : (
          <div className="relative w-full max-w-4xl">
            {/* Timeline line - shorter to avoid protrusion */}
            <div className="absolute left-1/2 top-8 bottom-8 w-0.5 bg-gray-700/50 transform -translate-x-1/2"></div>

            {/* Timeline content */}
            <div className="relative">
              {times.map((time) => (
                <div key={time} className="mb-10 relative">
                  {/* Time marker - now above circle and centered */}
                  <div className="absolute top-[-25px] left-1/2 transform -translate-x-1/2 text-lg font-semibold text-gray-300">
                    {time}
                  </div>

                  {/* Timeline dot */}
                  <div className="absolute left-1/2 top-2 w-3 h-3 bg-gray-500 rounded-full transform -translate-x-1/2 z-10"></div>

                  {/* Request cards */}
                  <div className="py-6">
                    {timeGroups[time].map((request) => (
                      <div
                        key={request.id}
                        className={`mb-4 flex ${
                          isLeftSide(time)
                            ? "justify-start pr-[52%]"
                            : "justify-end pl-[52%]"
                        }`}
                      >
                        <Card
                          className={`w-full p-4 bg-opacity-20 backdrop-blur-sm ${
                            request.status === "urgent"
                              ? "bg-red-950/30 border-red-500/60"
                              : request.status === "attention"
                              ? "bg-amber-950/30 border-amber-500/60"
                              : "bg-green-950/30 border-green-500/60"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-6 h-6 ${
                                statusColors[
                                  request.status as keyof typeof statusColors
                                ]
                              } mr-3 flex-shrink-0 rounded-md`}
                            ></div>
                            <span className="text-3xl font-bold mr-3 font-sans text-white">
                              {request.people}
                            </span>
                            <div className="flex space-x-2 ml-auto">
                              {request.isCelebration && (
                                <FaHeart className="text-red-400 text-xl" />
                              )}
                              {request.isVIP && (
                                <FaStar className="text-amber-400 text-xl" />
                              )}
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
