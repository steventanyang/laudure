import { ReactNode } from "react";
// Navigation types
export interface NavItem {
  name: string;
  path: string;
}

export interface IndicatorStyle {
  width?: string;
  transform?: string;
  height?: string;
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: string;
  left?: number;
  zIndex?: number;
  opacity?: number;
  borderRadius?: string;
}

// Treemap types
export interface MealData {
  name: string;
  count: number;
  color: string;
}

export interface HierarchyDatum {
  children: MealData[];
}

export interface TreemapNodeDatum extends d3.HierarchyNode<MealData> {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  data: MealData;
}

// Course selection types
export type CourseType = "appetizers" | "mains" | "desserts";

export interface CourseOption {
  id: CourseType;
  name: string;
  icon: ReactNode;
}

export interface MealDataByCourse {
  appetizers: MealData[];
  mains: MealData[];
  desserts: MealData[];
}
