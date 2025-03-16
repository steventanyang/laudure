import path from "path";
import fs from "fs";
import {
  UrgencyColor,
  RequestStatus,
  ProcessedKitchenNote,
  ReservationDetail,
  KitchenNoteDetail,
} from "@/types/index";

// Load agent-augmented data from JSON file
export async function loadAgentAugmentedData() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "agent-augmented-fine-dining-dataset.json"
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents);
}

// Map urgency color to request status
function mapUrgencyToStatus(urgency: UrgencyColor): RequestStatus {
  switch (urgency) {
    case "red":
      return "urgent";
    case "orange":
      return "attention";
    case "green":
      return "normal";
    default:
      return "normal";
  }
}

// Extract kitchen notes from agent-augmented data
export function getKitchenNotes(data: any) {
  const kitchenNotes: ProcessedKitchenNote[] = [];
  let noteId = 1;

  // Process each diner
  data.diners.forEach((diner: any) => {
    // Process each reservation
    diner.reservations?.forEach((reservation: any) => {
      // Check if agent_analysis exists and has kitchen_notes
      // First check coordinator_summary for kitchen_notes
      const kitchenNotesData =
        reservation.agent_analysis?.coordinator_summary?.kitchen_notes;

      if (kitchenNotesData && kitchenNotesData.length > 0) {
        // Collect all tags from all notes for this reservation
        const allTags = kitchenNotesData.flatMap(
          (note: any) => note.tags || []
        );
        const uniqueTags = [...new Set(allTags)] as string[];

        // Determine the most urgent status
        let mostUrgentColor: UrgencyColor = "green";
        kitchenNotesData.forEach((note: any) => {
          if (note.urgency === "red") {
            mostUrgentColor = "red";
          } else if (note.urgency === "orange" && mostUrgentColor !== "red") {
            mostUrgentColor = "orange";
          }
        });

        // Create a processed kitchen note
        kitchenNotes.push({
          id: noteId++,
          time: reservation.time,
          people: reservation.number_of_people,
          status: mapUrgencyToStatus(mostUrgentColor),
          name: diner.name,
          tags: uniqueTags,
        });
      }
    });
  });

  console.log(`Found ${kitchenNotes.length} kitchen notes`);

  // Sort by time
  return kitchenNotes.sort((a, b) => {
    // Convert time strings to comparable values (e.g., "18:30" to 1830)
    const timeA = parseInt(a.time.replace(":", ""));
    const timeB = parseInt(b.time.replace(":", ""));
    return timeA - timeB;
  });
}

// Extract comprehensive reservation data from agent-augmented data
export function getReservationDetails(data: any) {
  const reservationDetails: ReservationDetail[] = [];
  let reservationId = 1;

  // Process each diner
  data.diners.forEach((diner: any) => {
    // Process each reservation
    diner.reservations?.forEach((reservation: any) => {
      // Skip if no agent_analysis
      if (!reservation.agent_analysis) return;

      const coordinatorSummary = reservation.agent_analysis.coordinator_summary;
      const kitchenNotes = coordinatorSummary?.kitchen_notes || [];

      // Skip if no kitchen notes
      if (kitchenNotes.length === 0) return;

      // Collect all tags from all notes for this reservation
      const allTags = kitchenNotes.flatMap(
        (note: any) => note.tags || []
      );
      const uniqueTags = [...new Set(allTags)] as string[];

      // Determine the most urgent status
      let mostUrgentColor: UrgencyColor = "green";
      kitchenNotes.forEach((note: any) => {
        if (note.urgency === "red") {
          mostUrgentColor = "red";
        } else if (note.urgency === "orange" && mostUrgentColor !== "red") {
          mostUrgentColor = "orange";
        }
      });

      // Collect all dishes from orders
      const dishes = reservation.orders?.map((order: any) => order.item) || [];

      // Create a comprehensive reservation detail
      reservationDetails.push({
        id: reservationId++,
        time: reservation.time,
        date: reservation.date,
        people: reservation.number_of_people,
        status: mapUrgencyToStatus(mostUrgentColor),
        name: diner.name,
        tags: uniqueTags,
        // Additional details for expanded view
        dishes,
        notes: kitchenNotes.map((note: any) => ({
          note: note.note,
          dish: note.dish,
          tags: note.tags || [] as string[],
          urgency: note.urgency as UrgencyColor,
        })),
        priorityAlerts: coordinatorSummary?.priority_alerts,
        guestProfile: coordinatorSummary?.guest_profile,
        serviceRecommendations: coordinatorSummary?.service_recommendations,
      });
    });
  });

  console.log(
    `Found ${reservationDetails.length} reservations with kitchen notes`
  );

  // Sort by time
  return reservationDetails.sort((a, b) => {
    // Convert time strings to comparable values (e.g., "18:30" to 1830)
    const timeA = parseInt(a.time.replace(":", ""));
    const timeB = parseInt(b.time.replace(":", ""));
    return timeA - timeB;
  });
} 