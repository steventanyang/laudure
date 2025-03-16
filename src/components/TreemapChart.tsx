/**
 * TreemapChart Component
 *
 * This component renders an interactive treemap visualization using D3.js.
 * It displays hierarchical data with rectangles sized proportionally to their values,
 * providing an intuitive visualization of menu item popularity.
 *
 * Features:
 * - Responsive layout that adapts to container size
 * - Interactive hover effects to highlight selected items
 * - Automatic text wrapping for long item names
 * - Custom styling with rounded corners and color theming
 * - Smooth transitions for interactive elements
 *
 * Props:
 * - data: Array of MealData objects with name, count, and color properties
 * - width: Optional width override (defaults to container width)
 * - height: Optional height override (defaults to proportional height)
 *
 * Implementation:
 * - Uses D3.js for data visualization and DOM manipulation
 * - Implements custom text handling for different rectangle sizes
 * - Provides color manipulation for better text contrast
 * - Handles window resizing for responsive behavior
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { MealData, HierarchyDatum, TreemapNodeDatum } from "@/types";

interface TreemapProps {
  data: MealData[];
  width?: number;
  height?: number;
}

export default function TreemapChart({
  data,
  width = 800,
  height = 500,
}: TreemapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const containerWidth =
          svgRef.current.parentElement?.clientWidth || width;
        setDimensions({
          width: containerWidth,
          height: Math.min(containerWidth * 0.6, height),
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width, height]);

  // Function to darken a color
  const darkenColor = (color: string, factor = 0.4): string => {
    // Convert hex to RGB
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    // Darken the color
    r = Math.floor(r * factor);
    g = Math.floor(g * factor);
    b = Math.floor(b * factor);

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  // Create and update treemap
  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Prepare data for treemap
    const root = d3
      .hierarchy<HierarchyDatum>({ children: data })
      .sum((d) => {
        if ("count" in d && typeof d.count === "number") {
          return d.count;
        }
        return 0;
      })
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create treemap layout
    const treemapLayout = d3
      .treemap<HierarchyDatum>()
      .size([dimensions.width, dimensions.height])
      .paddingOuter(15)
      .paddingInner(12)
      .round(true);

    treemapLayout(root);

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    // Create cells
    const cell = svg
      .selectAll("g")
      .data(root.leaves() as unknown as TreemapNodeDatum[])
      .enter()
      .append("g")
      .attr("class", "cell")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    cell
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => d.data.color)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("class", "cell-rect")
      .style("transition", "opacity 0.25s ease-in-out");

    // Add meal name text - handle multi-line text for long names
    cell.each(function (d: TreemapNodeDatum) {
      const cellWidth = d.x1 - d.x0;
      const name = d.data.name;

      // Create text element
      const textElement = d3
        .select(this)
        .append("text")
        .attr("class", "cell-text")
        .attr("font-size", "22px")
        .attr("font-weight", "800")
        .attr("fill", darkenColor(d.data.color))
        .style("transition", "opacity 0.25s ease-in-out");

      // Split long names into multiple lines if needed
      if (name.includes(" ") && cellWidth < 180) {
        const words = name.split(" ");
        words.forEach((word: string, i: number) => {
          textElement
            .append("tspan")
            .attr("x", 20)
            .attr("y", 40 + i * 26) // Add line spacing
            .text(word);
        });
      } else {
        textElement.attr("x", 20).attr("y", 40).text(name);
      }
    });

    // Add count text
    cell
      .append("text")
      .attr("class", "cell-count")
      .attr("x", (d) => d.x1 - d.x0 - 30)
      .attr("y", (d) => d.y1 - d.y0 - 25)
      .attr("text-anchor", "end")
      .attr("font-size", "40px")
      .attr("font-weight", "900")
      .attr("fill", (d) => darkenColor(d.data.color))
      .text((d) => d.data.count)
      .style("transition", "opacity 0.25s ease-in-out");

    // Add hover effects - simplified to just opacity changes
    cell
      .on("mouseenter", function () {
        // Dim all other cells
        d3.selectAll(".cell").transition().duration(250).style("opacity", 0.4);

        // Highlight this cell
        d3.select(this).transition().duration(250).style("opacity", 1);
      })
      .on("mouseleave", function () {
        // Restore all cells
        d3.selectAll(".cell").transition().duration(250).style("opacity", 1);
      });
  }, [data, dimensions]);

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} className="w-full"></svg>
    </div>
  );
}
