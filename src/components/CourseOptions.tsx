import { CourseOption } from "@/types";

// Centralized course options with SVG definitions
export const courseOptions: CourseOption[] = [
  {
    id: "appetizers",
    name: "Appetizers",
    titleIcon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 40 40"
        className="inline-block mr-2 mb-1"
      >
        <polygon
          points="20,5 38,35 2,35"
          fill="white"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
    ),
    icon: (isSelected) => (
      <svg width="50" height="50" viewBox="0 0 40 40">
        <polygon
          points="20,5 38,35 2,35"
          fill={isSelected ? "white" : "#333"}
          stroke={isSelected ? "white" : "#333"}
          strokeWidth="2"
          className="transition-all duration-300"
        />
      </svg>
    ),
  },
  {
    id: "mains",
    name: "Mains",
    titleIcon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 30 30"
        className="inline-block mr-2 mb-1"
      >
        <rect
          x="3"
          y="3"
          width="24"
          height="24"
          fill="white"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
    ),
    icon: (isSelected) => (
      <svg width="50" height="50" viewBox="0 0 30 30">
        <rect
          x="3"
          y="3"
          width="24"
          height="24"
          fill={isSelected ? "white" : "#333"}
          stroke={isSelected ? "white" : "#333"}
          strokeWidth="2"
          className="transition-all duration-300"
        />
      </svg>
    ),
  },
  {
    id: "desserts",
    name: "Desserts",
    titleIcon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 30 30"
        className="inline-block mr-2 mb-1"
      >
        <polygon
          points="15,2 28,11 23,28 7,28 2,11"
          fill="white"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
    ),
    icon: (isSelected) => (
      <svg width="50" height="50" viewBox="0 0 30 30">
        <polygon
          points="15,2 28,11 23,28 7,28 2,11"
          fill={isSelected ? "white" : "#333"}
          stroke={isSelected ? "white" : "#333"}
          strokeWidth="2"
          className="transition-all duration-300"
        />
      </svg>
    ),
  },
]; 