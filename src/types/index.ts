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
  tags: string[];
  urgency: UrgencyColor;
}

export interface ProcessedKitchenNote {
  id: number;
  time: string;
  people: number;
  status: RequestStatus;
  name: string;
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
  time: string;
  date: string;
  people: number;
  status: RequestStatus;
  name: string;
  tags: string[];
  // Additional details for expanded view
  dishes: string[];
  notes: KitchenNoteDetail[];
  priorityAlerts?: PriorityAlert[];
  guestProfile?: GuestProfile;
  serviceRecommendations?: ServiceRecommendation[];
}

export interface KitchenNoteDetail {
  note: string;
  dish: string;
  tags: string[];
  urgency: UrgencyColor;
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
