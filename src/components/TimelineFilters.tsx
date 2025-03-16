import { useState, useEffect } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { IconType } from "react-icons";

// Define a type for the filters
export interface TimelineFiltersState {
  times: Record<string, boolean>;
  tags: Record<string, boolean>;
  status: {
    urgent: boolean;
    attention: boolean;
    normal: boolean;
  };
}

interface TimelineFiltersProps {
  times: string[];
  requestTagIcons: Record<string, { icon: IconType; label: string }>;
  isOpen: boolean;
  onToggle: () => void;
  onApplyFilters: (filters: TimelineFiltersState) => void; // New callback for applying filters
}

export default function TimelineFilters({
  times,
  requestTagIcons,
  isOpen,
  onToggle,
  onApplyFilters,
}: TimelineFiltersProps) {
  // Time slots state
  const [selectedTimes, setSelectedTimes] = useState<Record<string, boolean>>(
    times.reduce((acc, time) => ({ ...acc, [time]: true }), {})
  );

  // Add this useEffect to update the selected times when the times prop changes
  useEffect(() => {
    // Only update if times array has items and the selectedTimes is empty
    if (times.length > 0 && Object.keys(selectedTimes).length === 0) {
      setSelectedTimes(
        times.reduce((acc, time) => ({ ...acc, [time]: true }), {})
      );
    }
  }, [times, selectedTimes]);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<string | null>(null);

  // Tags state
  const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>(
    Object.keys(requestTagIcons).reduce(
      (acc, tag) => ({ ...acc, [tag]: true }),
      {}
    )
  );

  // Status state
  const [selectedStatus, setSelectedStatus] = useState({
    urgent: true,
    attention: true,
    normal: true,
  });

  // Toggle time slot selection
  const toggleTimeSlot = (time: string) => {
    setSelectedTimes({
      ...selectedTimes,
      [time]: !selectedTimes[time],
    });
  };

  // Drag selection handlers
  const handleTimeMouseDown = (time: string) => {
    setIsDragging(true);
    setDragStartTime(time);
    toggleTimeSlot(time);
  };

  const handleTimeMouseEnter = (time: string) => {
    if (isDragging && dragStartTime) {
      const selectState = selectedTimes[dragStartTime];
      if (selectedTimes[time] !== selectState) {
        setSelectedTimes({
          ...selectedTimes,
          [time]: selectState,
        });
      }
    }
  };

  const handleTimeMouseUp = () => {
    setIsDragging(false);
    setDragStartTime(null);
  };

  // Handle mouse up outside component
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStartTime(null);
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Tags selection
  const toggleTag = (tag: string) => {
    setSelectedTags({
      ...selectedTags,
      [tag]: !selectedTags[tag],
    });
  };

  // Select all tags
  const toggleAllTags = () => {
    const allSelected = Object.values(selectedTags).every(
      (selected) => selected
    );
    const newSelectedTags = Object.keys(selectedTags).reduce(
      (acc, tag) => ({ ...acc, [tag]: !allSelected }),
      {}
    );
    setSelectedTags(newSelectedTags);
  };

  // Status selection
  const toggleStatus = (status: "urgent" | "attention" | "normal") => {
    setSelectedStatus({
      ...selectedStatus,
      [status]: !selectedStatus[status],
    });
  };

  // Handle saving/applying filters
  const handleSaveFilters = () => {
    // Collect all filter states
    const filters: TimelineFiltersState = {
      times: selectedTimes,
      tags: selectedTags,
      status: selectedStatus,
    };

    // Apply the filters (this will trigger loading state in parent)
    onApplyFilters(filters);

    // Close the filter panel
    onToggle();
  };

  const resetFilters = () => {
    setSelectedTimes(
      times.reduce((acc, time) => ({ ...acc, [time]: true }), {})
    );
    setSelectedTags(
      Object.keys(requestTagIcons).reduce(
        (acc, tag) => ({ ...acc, [tag]: true }),
        {}
      )
    );
    setSelectedStatus({
      urgent: true,
      attention: true,
      normal: true,
    });
  };

  return (
    <>
      {/* Filter Sidepanel */}
      <div
        className={`fixed inset-y-0 left-0 w-96 bg-gray-950/95 border-r border-gray-800 shadow-xl z-50 overflow-y-auto transform transition-all duration-300 ease-in-out scrollbar-hide ${
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        <div className="p-8">
          {/* Close button */}
          <button
            onClick={onToggle}
            className="absolute top-10 right-6 text-white hover:text-gray-300 transition-colors duration-200"
          >
            <FaChevronLeft size={20} className="font-bold" />
          </button>

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-400">Filters</h2>
          </div>

          {/* Filter content */}
          <div className="space-y-8">
            {/* Time Filters */}
            <div>
              <h3 className="text-lg font-semibold text-gray-400 mb-4">
                Time Slots
              </h3>

              {/* Hour labels */}
              <div className="flex justify-between mb-1 px-1">
                <div className="text-base font-bold text-gray-300">18</div>
                <div className="text-base font-bold text-gray-300">19</div>
                <div className="text-base font-bold text-gray-300">20</div>
                <div className="text-base font-bold text-gray-300">21</div>
                <div className="text-base font-bold text-gray-300">22</div>
              </div>

              {/* Time slot grid - darker shade */}
              <div className="flex bg-gray-800/70 rounded-md h-10 overflow-hidden">
                {times.map((time, index) => (
                  <button
                    key={time}
                    onMouseDown={() => handleTimeMouseDown(time)}
                    onMouseEnter={() => handleTimeMouseEnter(time)}
                    onMouseUp={handleTimeMouseUp}
                    className={`flex-1 h-full flex items-center justify-center relative transition-all duration-200 ${
                      selectedTimes[time]
                        ? "bg-gray-300/90"
                        : "hover:bg-gray-700/50"
                    }`}
                  >
                    {index < times.length - 1 && (
                      <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-700/30"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Requests Filters */}
            <div>
              <h3 className="text-lg font-semibold text-gray-400 mb-4">
                Special Requests
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(requestTagIcons).map(
                  ([tag, { icon: TagIcon, label }]) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="flex flex-col items-center gap-2 transition-colors"
                    >
                      <TagIcon
                        className={`transition-colors duration-200 ${
                          selectedTags[tag] ? "text-gray-300" : "text-gray-500"
                        }`}
                        size={36}
                      />
                      <span className="text-sm text-center text-gray-500">
                        {label}
                      </span>
                    </button>
                  )
                )}

                {/* Select All button */}
                <button
                  onClick={toggleAllTags}
                  className="flex flex-col items-center gap-2 transition-colors"
                >
                  <div
                    className={`text-3xl font-bold transition-colors duration-200 ${
                      Object.values(selectedTags).every((selected) => selected)
                        ? "text-gray-300"
                        : "text-gray-500 hover:text-gray-400"
                    }`}
                  >
                    All
                  </div>
                  <span className="text-sm text-center text-gray-500">
                    Select All
                  </span>
                </button>
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <h3 className="text-lg font-semibold text-gray-400 mb-4">
                Status
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <button
                  onClick={() => toggleStatus("urgent")}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-8 h-8 rounded-md transition-colors ${
                      selectedStatus.urgent
                        ? "bg-red-500 hover:bg-red-400"
                        : "bg-gray-600 hover:bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-sm text-center text-gray-400">
                    Urgent
                  </span>
                </button>
                <button
                  onClick={() => toggleStatus("attention")}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-8 h-8 rounded-md transition-colors ${
                      selectedStatus.attention
                        ? "bg-amber-500 hover:bg-amber-400"
                        : "bg-gray-600 hover:bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-sm text-center text-gray-400">
                    Attention
                  </span>
                </button>
                <button
                  onClick={() => toggleStatus("normal")}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-8 h-8 rounded-md transition-colors ${
                      selectedStatus.normal
                        ? "bg-green-500 hover:bg-green-400"
                        : "bg-gray-600 hover:bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-sm text-center text-gray-400">
                    Normal
                  </span>
                </button>
              </div>
            </div>

            {/* Apply button - brightest element */}
            <div className="flex flex-col items-center pt-6">
              <button
                onClick={handleSaveFilters}
                className="w-full py-3 bg-gray-200 hover:bg-gray-100 text-black font-bold rounded-md shadow-md transition-colors duration-200"
              >
                Apply
              </button>
              <button
                onClick={resetFilters}
                className="text-sm font-bold text-gray-500 hover:text-gray-300 mt-5 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
