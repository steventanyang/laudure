import { Card } from "@/components/ui/card";
import { Shimmer } from "@/components/ui/shimmer";

export default function SkeletonTimeline() {
  // Sample times for the skeleton, extended to 22:00
  const times = [
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
  ];

  // Muted status colors for the skeleton
  const skeletonStatusColors = [
    "border-red-800/40 bg-red-950/20",
    "border-amber-800/40 bg-amber-950/20",
    "border-green-800/40 bg-green-950/20",
  ];

  // Helper function to determine if a time should be on the left or right
  const isLeftSide = (time: string) => {
    // Times ending in :00 are on the left, times ending in :30 are on the right
    return time.endsWith(":00");
  };

  return (
    <>
      {/* Title with shimmer */}
      <Shimmer className="w-64 h-8 mb-8 self-center" />

      <div className="relative w-full max-w-4xl">
        {/* Timeline line - shorter to avoid protrusion */}
        <div className="absolute left-1/2 top-8 bottom-8 w-0.5 bg-gray-700/50 transform -translate-x-1/2"></div>

        {/* Timeline content */}
        <div className="relative">
          {times.map((time) => (
            <div key={time} className="mb-10 relative">
              {/* Time marker - now above circle and centered */}
              <div className="absolute top-[-25px] left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-6 bg-gray-700/50 rounded-md"></div>
              </div>

              {/* Timeline dot */}
              <div className="absolute left-1/2 top-2 w-3 h-3 bg-gray-500 rounded-full transform -translate-x-1/2 z-10"></div>

              {/* Request cards */}
              <div className="py-6">
                {/* Show 1-2 cards based on time */}
                {Array.from({ length: isLeftSide(time) ? 2 : 1 }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className={`mb-4 flex ${
                        isLeftSide(time)
                          ? "justify-start pr-[52%]"
                          : "justify-end pl-[52%]"
                      }`}
                    >
                      <Card
                        className={`w-full p-4 backdrop-blur-sm border ${
                          skeletonStatusColors[i % skeletonStatusColors.length]
                        }`}
                      >
                        <div className="flex items-center">
                          {/* Status indicator - more muted */}
                          <div
                            className={`w-6 h-6 bg-gray-700/60 rounded-md mr-3`}
                          ></div>

                          {/* People count - matching the actual page */}
                          <div className="text-xl font-bold mr-3 bg-gray-700/60 w-6 h-6 rounded-md"></div>

                          <div className="flex space-x-2 ml-auto">
                            <div className="w-5 h-5 bg-gray-700/50 rounded-full"></div>
                            <div className="w-5 h-5 bg-gray-700/50 rounded-full"></div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
