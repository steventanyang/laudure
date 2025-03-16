import path from "path";
import fs from "fs";
import {
  UrgencyColor,
  ProcessedKitchenNote,
  ReservationDetail,
  DinerData,
  Diner,
  Reservation,
  KitchenNote,
} from "@/types/index";

// Load agent-augmented data from JSON file
export async function loadAgentAugmentedData() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "agent-augmented-fine-dining-dataset.json"
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents) as DinerData;
}

// Extract kitchen notes from agent-augmented data
export function getKitchenNotes(data: DinerData) {
  const kitchenNotes: ProcessedKitchenNote[] = [];
  let noteId = 1;

  // Process each diner
  data.diners.forEach((diner: Diner) => {
    // Process each reservation
    diner.reservations?.forEach((reservation: Reservation) => {
      // Check if agent_analysis exists and has kitchen_notes
      // First check coordinator_summary for kitchen_notes
      const kitchenNotesData =
        reservation.agent_analysis?.coordinator_summary?.kitchen_notes ||
        reservation.agent_analysis?.chef_notes ||
        [];

      if (kitchenNotesData.length > 0) {
        // Determine the most urgent status
        let mostUrgentColor: UrgencyColor = "green";
        kitchenNotesData.forEach((note: KitchenNote) => {
          if (note.urgency === "red") {
            mostUrgentColor = "red";
          } else if (note.urgency === "orange" && mostUrgentColor !== "red") {
            mostUrgentColor = "orange";
          }
        });

        // Process each kitchen note
        kitchenNotesData.forEach((note: KitchenNote) => {
          kitchenNotes.push({
            id: noteId++,
            name: diner.name,
            people: reservation.number_of_people,
            time: reservation.time,
            date: reservation.date,
            note: note.note,
            dish: note.dish,
            urgency: note.urgency,
            tags: note.tags || [],
          });
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
export function getReservationDetails(data: DinerData) {
  const reservationDetails: ReservationDetail[] = [];
  let reservationId = 1;

  // Process each diner
  data.diners.forEach((diner: Diner) => {
    // Process each reservation
    diner.reservations?.forEach((reservation: Reservation) => {
      // Skip if no agent_analysis
      if (!reservation.agent_analysis) return;

      // Get kitchen notes for this reservation
      const kitchenNotes =
        reservation.agent_analysis.coordinator_summary?.kitchen_notes ||
        reservation.agent_analysis.chef_notes ||
        [];

      // Skip if no kitchen notes
      if (kitchenNotes.length === 0) return;

      // Collect all tags from all notes for this reservation
      const allTags = kitchenNotes.flatMap(
        (note: KitchenNote) => note.tags || []
      );
      const uniqueTags = [...new Set(allTags)] as string[];

      // Determine the most urgent status
      let mostUrgentColor: UrgencyColor = "green";
      kitchenNotes.forEach((note: KitchenNote) => {
        if (note.urgency === "red") {
          mostUrgentColor = "red";
        } else if (note.urgency === "orange" && mostUrgentColor !== "red") {
          mostUrgentColor = "orange";
        }
      });

      // Map urgency color to status
      const status: "urgent" | "attention" | "normal" =
        (mostUrgentColor as string) === "red"
          ? "urgent"
          : (mostUrgentColor as string) === "orange"
          ? "attention"
          : "normal";

      // Collect all dishes from orders
      const dishes = reservation.orders?.map((order) => order.item) || [];

      // Create a comprehensive reservation detail
      reservationDetails.push({
        id: reservationId++,
        name: diner.name,
        people: reservation.number_of_people,
        time: reservation.time,
        date: reservation.date,
        status,
        tags: uniqueTags,
        dishes,
        notes: kitchenNotes.map((note: KitchenNote) => ({
          note: note.note,
          dish: note.dish,
          tags: note.tags || [],
          urgency: note.urgency,
        })),
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
