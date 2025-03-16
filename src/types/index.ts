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
  titleIcon: ReactNode;
  icon: (isSelected: boolean) => ReactNode;
}

export interface MealDataByCourse {
  appetizers: MealData[];
  mains: MealData[];
  desserts: MealData[];
}

// Volume chart types
export interface DetailedVolumeData {
  appetizersData: Record<string, string | number>[];
  mainsData: Record<string, string | number>[];
  dessertsData: Record<string, string | number>[];
  colors: {
    appetizers: string[];
    mains: string[];
    desserts: string[];
  };
}

// Timeline types
export type RequestStatus = "urgent" | "attention" | "normal";
export type UrgencyColor = "red" | "orange" | "green";

export interface SpecialRequest {
  id: number;
  time: string;
  people: number;
  status: RequestStatus;
  isVIP: boolean;
  isCelebration: boolean;
  name?: string;
  tags?: string[];
}

export interface KitchenNote {
  note: string;
  dish: string;
  urgency: UrgencyColor;
  tags?: string[];
}

export interface ProcessedKitchenNote {
  id: number;
  name: string;
  people: number;
  time: string;
  date: string;
  note: string;
  dish: string;
  urgency: UrgencyColor;
  tags: string[];
}

export interface TimelineGroup {
  [time: string]: SpecialRequest[];
}

export interface StatusColors {
  urgent: string;
  attention: string;
  normal: string;
}

export interface ReservationDetail {
  id: number;
  name: string;
  people: number;
  time: string;
  date: string;
  status: "urgent" | "attention" | "normal";
  tags: string[];
  dishes: string[];
  notes: KitchenNote[];
}

export interface PriorityAlert {
  alert: string;
  category: string;
  for: string;
}

export interface GuestProfile {
  dining_style: string;
  preferences: string[];
  avoid: string[];
}

export interface ServiceRecommendation {
  recommendation: string;
  timing: string;
  owner: string;
}

// Data structure types matching the JSON file
export interface Order {
  item: string;
  notes?: string;
}

export interface AgentAnalysis {
  coordinator_summary?: {
    kitchen_notes?: KitchenNote[];
  };
  chef_notes?: KitchenNote[];
}

export interface Reservation {
  time: string;
  date: string;
  number_of_people: number;
  orders: Order[];
  agent_analysis?: AgentAnalysis;
}

export interface Diner {
  name: string;
  reservations?: Reservation[];
}

export interface DinerData {
  diners: Diner[];
}
