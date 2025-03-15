"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem, IndicatorStyle } from "@/types";

const navItems: NavItem[] = [
  { name: "Overview", path: "/" },
  { name: "Timeline", path: "/timeline" },
  { name: "Special", path: "/special" },
  { name: "View All", path: "/view-all" },
];

export default function Navigation() {
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

  return (
    <nav className="relative flex justify-center w-full bg-black text-white pt-8">
      <div className="flex justify-center w-full max-w-4xl">
        <div
          className="relative flex justify-between w-full"
          ref={navContainerRef}
        >
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
              className={`py-4 px-8 text-center transition-colors relative z-10 font-bold ${
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
    </nav>
  );
}
