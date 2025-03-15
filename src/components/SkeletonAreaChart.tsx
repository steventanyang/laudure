import { Shimmer } from "@/components/ui/shimmer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SkeletonAreaChart() {
  // Sample legend items
  const legendItems = [
    { color: "#555", name: "Item 1" },
    { color: "#666", name: "Item 2" },
    { color: "#777", name: "Item 3" },
    { color: "#888", name: "Item 4" },
    { color: "#999", name: "Item 5" },
  ];

  return (
    <Card className="w-full max-w-5xl bg-black border-0">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="text-2xl font-bold text-white">
          <Shimmer className="w-48 h-8 inline-block" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] relative">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-5">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-gray-700/30" />
            ))}
          </div>

          {/* X-axis */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-700" />

          {/* Y-axis */}
          <div className="absolute top-0 left-0 w-[1px] h-full bg-gray-700" />

          {/* Chart area - static placeholder */}
          <div className="absolute top-[10%] left-[5%] w-[90%] h-[80%]">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Area paths */}
              <path
                d="M0,80 C20,70 40,40 60,30 S80,50 100,40 L100,100 L0,100 Z"
                fill="#444"
                opacity="0.3"
              />
              <path
                d="M0,60 C20,50 40,20 60,10 S80,30 100,20 L100,100 L0,100 Z"
                fill="#555"
                opacity="0.3"
              />
              <path
                d="M0,40 C20,30 40,10 60,5 S80,15 100,10 L100,100 L0,100 Z"
                fill="#666"
                opacity="0.3"
              />
            </svg>
          </div>
        </div>
      </CardContent>

      {/* Legend skeleton */}
      <div className="flex flex-wrap justify-center gap-4 mt-2 mb-6 max-w-4xl px-4">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center mr-4 mb-2">
            <div
              className="w-4 h-4 mr-2"
              style={{ backgroundColor: item.color }}
            ></div>
            <Shimmer className="w-16 h-4" />
          </div>
        ))}
      </div>
    </Card>
  );
}
