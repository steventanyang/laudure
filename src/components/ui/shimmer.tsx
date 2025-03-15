import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className }: ShimmerProps) {
  return (
    <div className={cn("animate-pulse rounded-md bg-gray-700/50", className)}>
      <div className="relative overflow-hidden w-full h-full">
        <div className="shimmer-effect absolute inset-0"></div>
      </div>
    </div>
  );
} 