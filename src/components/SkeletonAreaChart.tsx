import { Shimmer } from "@/components/ui/shimmer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SkeletonAreaChart() {
  return (
    <Card className="w-full max-w-5xl bg-black border-gray-800">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="text-2xl font-bold text-white">
          <Shimmer className="w-64 h-8" />
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
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
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
    </Card>
  );
} 