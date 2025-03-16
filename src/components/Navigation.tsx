/**
 * Navigation Component
 *
 * This component provides the main navigation bar for the application.
 * It displays tabs for different sections and contextual controls based on the current page.
 *
 * Features:
 * - Responsive navigation with active tab highlighting
 * - Context-aware controls (filters button on timeline page)
 * - Fixed positioning with backdrop blur for better readability
 * - Automatic active tab detection based on current route
 *
 * Props:
 * - toggleFilters: Optional callback function for toggling filter panel
 * - handlePrint: Optional callback function for print functionality
 *
 * Usage:
 * - Include at the top of page layouts
 * - Pass appropriate callbacks for page-specific functionality
 */

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/types";
import { FaFilter } from "react-icons/fa";

const navItems: NavItem[] = [
  { name: "Overview", path: "/" },
  { name: "Volume", path: "/volume" },
  { name: "Timeline", path: "/timeline" },
];

interface NavigationProps {
  toggleFilters?: () => void; // Optional prop for toggling filters
  handlePrint?: () => void; // Add this prop
}

export default function Navigation({ toggleFilters }: NavigationProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>(pathname);
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Update active tab when path changes
  useEffect(() => {
    const currentPath = navItems.find((item) => item.path === pathname)
      ? pathname
      : "/";

    setActiveTab(currentPath);
  }, [pathname]);

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
              className="flex items-center px-4 py-2 text-gray-300 hover:text-white font-bold transition-colors duration-200"
            >
              <FaFilter className="mr-2" size={14} />
              Filters
            </button>
          )}
        </div>

        {/* Center the navigation tabs */}
        <div className="flex justify-center flex-1">
          <div className="relative flex justify-center" ref={navContainerRef}>
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
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Print button on the right - only show on timeline page */}
        <div className="w-48 flex justify-end">
          {/* Print button is now handled separately */}
        </div>
      </div>
    </nav>
  );
}
