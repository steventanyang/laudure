import { ReservationDetail } from "@/types";
import { FaPrint } from "react-icons/fa";
import { getDishCategoryAndColor } from "@/lib/utils";

interface PrintReservationsProps {
  reservations: ReservationDetail[];
  date: string;
}

export default function PrintReservations({
  reservations,
  date,
}: PrintReservationsProps) {
  const debugReservationData = () => {
    console.log("Reservations data:", reservations);
    if (reservations.length > 0) {
      console.log("First reservation:", reservations[0]);
      console.log("Dishes in first reservation:", reservations[0].dishes);
      if (reservations[0].dishes && reservations[0].dishes.length > 0) {
        console.log("First dish:", reservations[0].dishes[0]);
      }
    }
  };

  const handlePrint = () => {
    // Debug the data
    debugReservationData();

    // Create a hidden print-only div if it doesn't exist
    let printContainer = document.getElementById("print-container");
    if (!printContainer) {
      printContainer = document.createElement("div");
      printContainer.id = "print-container";
      printContainer.className = "print-only";
      document.body.appendChild(printContainer);
    }

    // Generate the HTML content for printing
    const printContent = `
      <div class="print-header">Reservations - ${date}</div>
      ${reservations
        .map(
          (reservation) => `
          <div class="print-reservation ${reservation.status}">
            <div class="print-left-border"></div>
            <div class="print-content">
              <div class="print-header-row">
                <div class="print-people">${reservation.people}</div>
                <div class="print-name-time">
                  <div class="print-name">${reservation.name}</div>
                  <div class="print-time">${reservation.time} • ${date}</div>
                </div>
              </div>
              
              <div class="print-section">
                <div class="print-section-title">Menu Items</div>
                ${(() => {
                  // Check if dishes exists and has items
                  if (!reservation.dishes || reservation.dishes.length === 0) {
                    return '<div class="print-dish">No menu items specified</div>';
                  }

                  // Map through dishes - now with shapes and bold text
                  return reservation.dishes
                    .map((dish) => {
                      const dishText =
                        typeof dish === "string" ? dish : "Unknown dish";

                      // Get category and add appropriate shape
                      let shapeIcon = "";

                      if (dishText === "Chef's Tasting Menu") {
                        // Star shape for Chef's Menu
                        shapeIcon = `<svg width="16" height="16" viewBox="0 0 24 24" class="print-dish-icon">
                          <path d="M12 2L14.5 9H22L16 13.5L18 21L12 17L6 21L8 13.5L2 9H9.5L12 2Z" 
                            fill="#333" stroke="#333" strokeWidth="1" />
                        </svg>`;
                      } else {
                        const { category } = getDishCategoryAndColor(dishText);
                        if (category === "appetizers") {
                          // Triangle
                          shapeIcon = `<svg width="16" height="16" viewBox="0 0 40 40" class="print-dish-icon">
                            <polygon points="20,5 38,35 2,35" fill="#333" stroke="#333" strokeWidth="2" />
                          </svg>`;
                        } else if (category === "mains") {
                          // Square
                          shapeIcon = `<svg width="16" height="16" viewBox="0 0 30 30" class="print-dish-icon">
                            <rect x="3" y="3" width="24" height="24" fill="#333" stroke="#333" strokeWidth="2" />
                          </svg>`;
                        } else if (category === "desserts") {
                          // Pentagon
                          shapeIcon = `<svg width="16" height="16" viewBox="0 0 30 30" class="print-dish-icon">
                            <polygon points="15,2 28,11 23,28 7,28 2,11" fill="#333" stroke="#333" strokeWidth="2" />
                          </svg>`;
                        } else {
                          // Circle for other
                          shapeIcon = `<svg width="16" height="16" viewBox="0 0 30 30" class="print-dish-icon">
                            <circle cx="15" cy="15" r="12" fill="#333" stroke="#333" strokeWidth="2" />
                          </svg>`;
                        }
                      }

                      return `<div class="print-dish">
                        <span class="print-dish-text">${dishText}</span>
                        <span class="print-dish-shape">${shapeIcon}</span>
                      </div>`;
                    })
                    .join("");
                })()}
              </div>
              
              <div class="print-section">
                <div class="print-section-title">Special Requests</div>
                ${
                  reservation.notes && reservation.notes.length > 0
                    ? reservation.notes
                        .map(
                          (note) => `
                        <div class="print-note print-${
                          note.urgency === "red"
                            ? "urgent"
                            : note.urgency === "orange"
                            ? "attention"
                            : "normal"
                        }">
                          <div class="print-dish-name">${note.dish}</div>
                          <div class="print-note-text">${note.note}</div>
                        </div>
                      `
                        )
                        .join("")
                    : '<div class="print-note">No special requests</div>'
                }
              </div>
            </div>
          </div>
        `
        )
        .join("")}
    `;

    // Add the print styles with darker text
    const printStyles = `
      <style>
        @media print {
          /* Hide the regular page content */
          body > *:not(.print-only) {
            display: none !important;
          }
          
          /* Show the print container */
          .print-only {
            display: block !important;
            width: 100%;
            max-width: 100%;
            padding: 0;
            margin: 0;
          }
          
          /* Page setup */
          @page {
            size: portrait;
            margin: 0.5in;
          }
        }
        
        /* Print styles */
        .print-only {
          display: none;
          font-family: system-ui, -apple-system, sans-serif;
          color: #000; /* Ensure text is black */
        }
        
        .print-header {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 30px;
          color: #000;
        }
        
        .print-reservation {
          position: relative;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid #aaa;
          page-break-inside: avoid;
          display: flex;
        }
        
        .print-left-border {
          width: 6px;
          background-color: #4caf50;
          margin-right: 15px;
          border-radius: 3px;
        }
        
        .print-reservation.urgent .print-left-border {
          background-color: #f44336;
        }
        
        .print-reservation.attention .print-left-border {
          background-color: #ff9800;
        }
        
        .print-content {
          flex: 1;
        }
        
        .print-header-row {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .print-people {
          font-size: 28px;
          font-weight: bold;
          margin-right: 15px;
          color: #000;
        }
        
        .print-name {
          font-size: 22px;
          font-weight: bold;
          color: #000;
        }
        
        .print-time {
          font-size: 14px;
          color: #333;
          margin-top: 3px;
        }
        
        .print-section {
          margin-top: 20px;
        }
        
        .print-section-title {
          font-weight: 900;
          margin-bottom: 10px;
          font-size: 16px;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .print-dish {
          margin-bottom: 8px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
          color: #000;
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }
        
        .print-dish-text {
          font-weight: 600;
        }
        
        .print-dish-shape {
          margin-left: 8px;
        }
        
        .print-dish-icon {
          vertical-align: middle;
        }
        
        .print-note {
          margin-bottom: 10px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
          border-left: 4px solid #4caf50;
          color: #000;
        }
        
        .print-note.print-urgent {
          border-left: 4px solid #f44336;
        }
        
        .print-note.print-attention {
          border-left: 4px solid #ff9800;
        }
        
        .print-dish-name {
          font-weight: 600;
          margin-bottom: 5px;
          color: #000;
        }
        
        .print-note-text {
          color: #000;
        }
      </style>
    `;

    // Set the content of the print container
    printContainer.innerHTML = printStyles + printContent;

    // Trigger the print dialog
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white rounded-md transition-colors duration-200"
    >
      <FaPrint className="mr-2" size={14} />
      Print
    </button>
  );
}
