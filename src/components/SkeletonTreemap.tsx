/**
 * SkeletonTreemap Component
 *
 * This component provides a loading placeholder for the TreemapChart.
 * It displays a shimmer effect in the shape of a treemap layout to indicate
 * that data is being loaded.
 *
 * Features:
 * - Mimics the layout of the actual treemap with different sized boxes
 * - Uses Shimmer component for animated loading effect
 * - Maintains consistent dimensions with the actual chart
 * - Provides visual continuity during data loading
 *
 * Usage:
 * - Display while fetching treemap data
 * - Replace with actual TreemapChart when data is available
 */

import { Shimmer } from "@/components/ui/shimmer";

export default function SkeletonTreemap() {
  return (
    <div className="w-full h-[500px] relative">
      {/* Large boxes */}
      <Shimmer className="absolute top-0 left-0 w-[40%] h-[40%]" />
      <Shimmer className="absolute top-0 right-0 w-[58%] h-[25%]" />
      <Shimmer className="absolute top-[27%] right-0 w-[58%] h-[13%]" />

      {/* Medium boxes */}
      <Shimmer className="absolute top-[42%] left-0 w-[30%] h-[30%]" />
      <Shimmer className="absolute top-[42%] left-[32%] w-[30%] h-[30%]" />
      <Shimmer className="absolute top-[42%] right-0 w-[36%] h-[30%]" />

      {/* Small boxes */}
      <Shimmer className="absolute bottom-0 left-0 w-[24%] h-[26%]" />
      <Shimmer className="absolute bottom-0 left-[26%] w-[24%] h-[26%]" />
      <Shimmer className="absolute bottom-0 left-[52%] w-[24%] h-[26%]" />
      <Shimmer className="absolute bottom-0 right-0 w-[22%] h-[26%]" />
    </div>
  );
}
