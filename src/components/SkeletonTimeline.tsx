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

  // Helper function to determine if a time should be on the left or right
  const isLeftSide = (time: string) => {
    // Times ending in :00 are on the left, times ending in :30 are on the right
    return time.endsWith(":00");
  };

  return (
    <>
      {/* Date shimmer */}
      <Shimmer className="w-64 h-8 mb-8 self-center" />

      <div className="relative w-full max-w-4xl">
        {/* Timeline line */}
        <div className="absolute left-1/2 top-0 bottom-0 border-dashed border-l border-gray-700/80 transform -translate-x-1/2 h-full"></div>

        {/* Timeline content */}
        <div className="relative">
          {times.map((time) => (
            <div key={time} className="mb-10 relative">
              {/* Timeline dot */}
              <div className="absolute left-1/2 top-2 w-3 h-3 bg-gray-400 rounded-full transform -translate-x-1/2 z-10"></div>

              {/* Request cards */}
              <div className="py-6 relative">
                {/* Large time display in empty space */}
                <div
                  className={`absolute top-1/2 transform -translate-y-1/2 ${
                    isLeftSide(time) ? "right-8" : "left-8"
                  } ${
                    isLeftSide(time) ? "text-right" : "text-left"
                  } opacity-30 pointer-events-none`}
                >
                  <div className="text-7xl font-bold text-gray-700">{time}</div>
                  <div className="text-xl text-gray-700 mt-2">
                    <Shimmer
                      className={`h-6 ${
                        isLeftSide(time) ? "w-48 ml-auto" : "w-48"
                      }`}
                    />
                  </div>
                </div>

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
                      <Card className="w-full p-4 backdrop-blur-sm border border-gray-800/60 bg-gray-800/30">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {/* People count */}
                            <div className="h-8 w-8 bg-gray-700/60 rounded-md mr-3"></div>
                            {/* Name */}
                            <Shimmer className="h-8 w-32" />
                          </div>

                          <div className="flex space-x-2">
                            <div className="w-6 h-6 bg-gray-700/50 rounded-full"></div>
                            <div className="w-6 h-6 bg-gray-700/50 rounded-full"></div>
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
