// API types for restaurant data
export interface Order {
  item: string;
  dietary_tags: string[];
  price: number;
}

export interface Reservation {
  date: string;
  number_of_people: number;
  orders: Order[];
  time: string;
}

export interface Email {
  date: string;
  subject: string;
  combined_thread: string;
}

export interface Review {
  restaurant_name: string;
  date: string;
  rating: number;
  content: string;
}

export interface Diner {
  name: string;
  reviews?: Review[];
  reservations?: Reservation[];
  emails?: Email[];
}

export interface DinersList {
  diners: Diner[];
}

// Processed data types for analytics
export interface MenuItemCount {
  name: string;
  count: number;
}

export interface MenuAnalytics {
  appetizers: MenuItemCount[];
  mains: MenuItemCount[];
  desserts: MenuItemCount[];
}
