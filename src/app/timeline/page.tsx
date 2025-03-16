/**
 * Timeline Page
 *
 * This page displays a chronological timeline of restaurant reservations with special requests
 * and kitchen notes. It provides a visual representation of the dining service flow throughout
 * the evening, highlighting reservations that require special attention.
 *
 * Features:
 * - Interactive timeline with time-based sections (18:00, 18:30, etc.)
 * - Visual indicators for reservation priority (urgent, attention, normal)
 * - Detailed side panel for viewing complete reservation information
 * - Filtering system for time slots, status levels, and special request tags
 * - Navigation between reservations with keyboard support
 * - Print functionality for physical kitchen reference
 *
 * Components:
 * - TimeSection: Renders a section of the timeline for a specific time slot
 * - DetailPanel: Shows detailed information about a selected reservation
 * - TimelineFilters: Provides filtering controls for the timeline
 * - Navigation: Top navigation bar with filter toggle
 * - PrintReservations: Generates printable version of filtered reservations
 *
 * Data Flow:
 * 1. Fetches reservation data from /api/timeline-data
 * 2. Groups and sorts reservations by time and priority
 * 3. Applies user-selected filters
 * 4. Renders timeline with interactive elements
 */

"use client";

import { useState, useEffect, useRef } from "react";
import SkeletonTimeline from "@/components/SkeletonTimeline";
// Import icons from a common icon library
import {
  FaBan,
  FaBreadSlice,
  FaAllergies,
  FaStar,
  FaRing,
  FaUtensils,
  FaGift,
} from "react-icons/fa";
import { IconType } from "react-icons";
import type { ReservationDetail } from "@/types";
// Import the new component
import TimelineFilters, {
  TimelineFiltersState,
} from "@/components/TimelineFilters";
import Navigation from "@/components/Navigation";
import PrintReservations from "@/components/PrintReservations";
// Import our new component - removed ReservationCard since it's not used directly
import TimeSection from "@/components/timeline/TimeSection";
import DetailPanel from "@/components/timeline/DetailPanel";

// Define tag types and their corresponding icons
const requestTagIcons: Record<string, { icon: IconType; label: string }> = {
  "dairy free": { icon: FaBan, label: "Dairy Free" },
  "gluten free": { icon: FaBreadSlice, label: "Gluten Free" },
  "nut free": { icon: FaAllergies, label: "Nut Free" },
  critic: { icon: FaStar, label: "Critic" },
  prop: { icon: FaRing, label: "Special Prop" },
  "adjust dish": { icon: FaUtensils, label: "Adjust Dish" },
  "special request": { icon: FaGift, label: "Special Request" },
};

// Timeline component
export default function Special() {
  const [reservations, setReservations] = useState<ReservationDetail[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<
    ReservationDetail[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationDetail | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeTime, setActiveTime] = useState<string | null>(null);
  const timeSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // At the top of the component, simplify the date format
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  // Fetch kitchen notes data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const startTime = Date.now();

        const response = await fetch("/api/timeline-data");

        if (!response.ok) {
          throw new Error("Failed to fetch reservation details");
        }

        const data = await response.json();
        setReservations(data);
        setFilteredReservations(data);

        // Ensure loading state shows for at least 500ms
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 500 - elapsedTime);

        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when they change
  const applyFilters = (filters: TimelineFiltersState) => {
    setIsFiltering(true);

    // Close the side panel if it's open
    if (isPanelVisible) {
      setIsPanelVisible(false);
      setIsOverlayVisible(false);
      setSelectedReservation(null);
      setActiveTime(null); // Reset active time
    }

    setTimeout(() => {
      const filtered = reservations.filter((reservation) => {
        // Filter by time
        if (!filters.times[reservation.time]) return false;

        // Filter by status
        if (!filters.status[reservation.status as keyof typeof filters.status])
          return false;

        // Filter by tags (if the reservation has any of the selected tags)
        if (reservation.tags && reservation.tags.length > 0) {
          // If any tag is selected that matches the reservation, keep it
          const hasSelectedTag = reservation.tags.some(
            (tag) => filters.tags[tag]
          );
          if (!hasSelectedTag) return false;
        }

        return true;
      });

      setFilteredReservations(filtered);
      setIsFiltering(false);
    }, 800);
  };

  // Add this function to get ordered reservations for navigation
  const getOrderedReservations = () => {
    // Create the same order as displayed on screen
    const ordered: ReservationDetail[] = [];

    // Get all time slots in display order
    const times = Object.keys(sortedTimeGroups).sort((a, b) => {
      // Sort by time (e.g., "18:00", "18:30", etc.)
      return a.localeCompare(b);
    });

    // For each time slot, add reservations in order of priority
    times.forEach((time) => {
      ordered.push(...sortedTimeGroups[time]);
    });

    return ordered;
  };

  // Update the navigation functions
  const getPrevReservation = () => {
    if (!selectedReservation) return null;

    // Get all reservations in display order
    const orderedReservations = getOrderedReservations();

    // Find current index
    const currentIndex = orderedReservations.findIndex(
      (r) => r.id === selectedReservation.id
    );

    // Return previous reservation or null if at the start
    return currentIndex > 0 ? orderedReservations[currentIndex - 1] : null;
  };

  const getNextReservation = () => {
    if (!selectedReservation) return null;

    // Get all reservations in display order
    const orderedReservations = getOrderedReservations();

    // Find current index
    const currentIndex = orderedReservations.findIndex(
      (r) => r.id === selectedReservation.id
    );

    // Return next reservation or null if at the end
    return currentIndex < orderedReservations.length - 1
      ? orderedReservations[currentIndex + 1]
      : null;
  };

  // Navigate to prev/next reservation
  const navigateReservation = (direction: "prev" | "next") => {
    const targetReservation =
      direction === "prev" ? getPrevReservation() : getNextReservation();

    if (targetReservation) {
      setSelectedReservation(targetReservation);

      // Set the active time
      const newActiveTime = targetReservation.time;

      // Only scroll if the time is changing
      if (activeTime !== newActiveTime) {
        setActiveTime(newActiveTime);

        // Scroll to the time section with a small delay to ensure UI has updated
        setTimeout(() => {
          const timeSection = timeSectionRefs.current[newActiveTime];
          if (timeSection) {
            timeSection.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    }
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">
          {error || "Failed to load special requests"}
        </div>
      </div>
    );
  }

  // Group requests by time
  const timeGroups = filteredReservations.reduce((groups, request) => {
    if (!groups[request.time]) {
      groups[request.time] = [];
    }
    groups[request.time].push(request);
    return groups;
  }, {} as Record<string, ReservationDetail[]>);

  // Sort reservations by importance within each time group
  const sortedTimeGroups = Object.keys(timeGroups).reduce((sorted, time) => {
    // Sort the reservations for this time slot by status priority
    sorted[time] = timeGroups[time].sort((a, b) => {
      // Define priority values for each status
      const getPriority = (status: string) => {
        switch (status) {
          case "urgent":
            return 1;
          case "attention":
            return 2;
          case "normal":
            return 3;
          default:
            return 4;
        }
      };

      // Sort by priority (lower number = higher priority)
      return getPriority(a.status) - getPriority(b.status);
    });

    return sorted;
  }, {} as Record<string, ReservationDetail[]>);

  // Get unique times in order
  const times = Object.keys(sortedTimeGroups).sort();

  // Handle reservation click
  const handleReservationClick = (reservation: ReservationDetail) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedReservation(reservation);
    setActiveTime(reservation.time);
    setIsOverlayVisible(true);
    setTimeout(() => {
      setIsPanelVisible(true);
      setTimeout(() => setIsAnimating(false), 300);
    }, 50);
  };

  // Close side panel
  const closeSidePanel = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsPanelVisible(false);

    setTimeout(() => {
      setIsOverlayVisible(false);
      setActiveTime(null); // Reset active time when closing panel

      setTimeout(() => {
        setSelectedReservation(null);
        setIsAnimating(false);
      }, 300);
    }, 100);
  };

  const toggleFilterPanel = () => {
    if (!isFilterPanelOpen && reservations.length > 0) {
      // When opening, ensure the times are properly loaded
      // This is a backup in case the useEffect in TimelineFilters doesn't catch it
      // const allTimesSelected = Object.keys(
      //   reservations.reduce(
      //     (times, res) => ({ ...times, [res.time]: true }),
      //     {}
      //   )
      // );

      // Then toggle the panel
      setIsFilterPanelOpen(true);
    } else {
      setIsFilterPanelOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation
        toggleFilters={toggleFilterPanel}
        handlePrint={() => {}} // We'll handle print differently
      />

      {/* Update the print button positioning to match filters button exactly */}
      <div className="fixed top-2 right-8 z-50 py-4">
        <PrintReservations reservations={filteredReservations} date={today} />
      </div>

      <div className="pt-28 pb-8 px-8 relative overflow-hidden scrollbar-hide">
        <TimelineFilters
          times={Object.keys(
            reservations.reduce(
              (times, res) => ({ ...times, [res.time]: true }),
              {}
            )
          )}
          requestTagIcons={requestTagIcons}
          isOpen={isFilterPanelOpen}
          onToggle={toggleFilterPanel}
          onApplyFilters={applyFilters}
        />

        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-8">{today}</h1>

          {loading || isFiltering ? (
            <SkeletonTimeline />
          ) : filteredReservations.length === 0 ? (
            <div className="w-full max-w-4xl py-16 flex flex-col items-center justify-center text-center">
              <div className="text-gray-400 text-xl font-bold">
                No reservations match your filters
              </div>
            </div>
          ) : (
            <div className="relative w-full max-w-4xl">
              {/* Timeline line - only dotted with gradient fade */}
              <div className="absolute left-1/2 top-0 bottom-0 border-dashed border-l border-gray-700/80 transform -translate-x-1/2 h-full"></div>

              {/* Timeline content */}
              <div className="relative">
                {times.map((time) => (
                  <TimeSection
                    key={time}
                    time={time}
                    reservations={sortedTimeGroups[time]}
                    activeTime={activeTime}
                    selectedReservationId={selectedReservation?.id || null}
                    isAnimating={isAnimating}
                    onReservationClick={handleReservationClick}
                    refCallback={(el) => {
                      timeSectionRefs.current[time] = el;
                    }}
                    requestTagIcons={requestTagIcons}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      {selectedReservation && (
        <DetailPanel
          reservation={selectedReservation}
          isPanelVisible={isPanelVisible}
          onClose={closeSidePanel}
          onNavigate={navigateReservation}
          hasPrev={!!getPrevReservation()}
          hasNext={!!getNextReservation()}
          requestTagIcons={requestTagIcons}
        />
      )}

      {/* Overlay with hole for selected card */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-40 ${
          isOverlayVisible ? "opacity-70" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidePanel}
      ></div>
    </div>
  );
}
