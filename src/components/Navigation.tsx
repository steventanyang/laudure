"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem, IndicatorStyle } from "@/types";
import { FaFilter } from "react-icons/fa";

const navItems: NavItem[] = [
  { name: "Overview", path: "/" },
  { name: "Volume", path: "/volume" },
  { name: "Timeline", path: "/timeline" },
];

interface NavigationProps {
  toggleFilters?: () => void; // Optional prop for toggling filters
}

export default function Navigation({ toggleFilters }: NavigationProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>(pathname);
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>({
    opacity: 0, // Start invisible until we measure
  });
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Initialize the indicator after the component mounts
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      updateIndicator(pathname);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Update indicator when path changes
  useEffect(() => {
    const currentPath = navItems.find((item) => item.path === pathname)
      ? pathname
      : "/";

    setActiveTab(currentPath);
    updateIndicator(currentPath);
  }, [pathname]);

  const updateIndicator = (path: string) => {
    const index = navItems.findIndex((item) => item.path === path);
    if (index !== -1 && navRefs.current[index]) {
      const element = navRefs.current[index];
      if (element) {
        setIndicatorStyle({
          width: `${element.offsetWidth}px`,
          transform: `translateX(${element.offsetLeft}px)`,
          height: "80%", // Reduced height for tighter appearance
          position: "absolute",
          top: "10%", // Center it vertically
          left: 0,
          zIndex: 0,
          opacity: 1,
          borderRadius: "8px",
        });
      }
    }
  };

  // Check if we're on the timeline page
  const isTimelinePage = pathname === "/timeline";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-sm py-4 px-8">
      <div className="flex items-center justify-between w-full">
        {/* Filter button on the left - only show on timeline page */}
        <div className="w-48">
          {isTimelinePage && toggleFilters && (
            <button
              onClick={toggleFilters}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-3 rounded-md transition-colors duration-200"
            >
              <FaFilter size={16} />
              <span className="font-medium">Filters</span>
            </button>
          )}
        </div>

        {/* Center the navigation tabs */}
        <div className="flex justify-center flex-1">
          <div className="relative flex justify-center" ref={navContainerRef}>
            {/* Background indicator that moves */}
            <div
              className="absolute bg-zinc-800 transition-all duration-300 ease-in-out"
              style={indicatorStyle}
            />

            {navItems.map((item, index) => (
              <Link
                key={item.path}
                href={item.path}
                ref={(el) => {
                  if (el) navRefs.current[index] = el;
                }}
                className={`py-4 px-12 text-center transition-colors relative z-10 font-bold ${
                  activeTab === item.path
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                onClick={() => {
                  setActiveTab(item.path);
                  updateIndicator(item.path);
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Empty space on the right to balance the layout */}
        <div className="w-48"></div>
      </div>
    </nav>
  );
}
