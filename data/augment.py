import json
import random
from datetime import datetime, timedelta
import copy
import statistics

def load_data(file_path):
    """Load JSON data from file."""
    with open(file_path, 'r') as f:
        return json.load(f)

def save_data(data, output_file):
    """Save JSON data to file."""
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

def has_tasting_menu(reservation):
    """Check if reservation includes Chef's Tasting Menu."""
    for order in reservation.get('orders', []):
        if order.get('item') == "Chef's Tasting Menu":
            return True
    return False

def categorize_menu_items():
    """Categorize menu items based on items.txt."""
    appetizers = []
    mains = []
    desserts = []
    
    current_category = None
    
    try:
        with open("items.txt", 'r') as f:
            for line in f:
                line = line.strip()
                if "Appetizers/Starters:" in line:
                    current_category = "appetizers"
                elif "Main Courses:" in line:
                    current_category = "mains"
                elif "Desserts:" in line:
                    current_category = "desserts"
                elif line.startswith("- "):
                    item = line[2:].split(" (")[0].strip()
                    if current_category == "appetizers":
                        appetizers.append(item)
                    elif current_category == "mains":
                        mains.append(item)
                    elif current_category == "desserts":
                        desserts.append(item)
    except FileNotFoundError:
        # Fallback if items.txt is not found
        appetizers = ["Escargots", "Foie Gras", "Salmon Tartare", "Lobster Bisque", "Salade Niçoise"]
        mains = ["Beef Bourguignon", "Boeuf Bourguignon", "Coq au Vin", "Duck Confit", "Rabbit Roulade", "Salmon en Papillote"]
        desserts = ["Chocolate Soufflé", "Crème Brûlée"]
    
    return appetizers, mains, desserts

def get_average_price(data, item_name):
    """Get the average price of an item from existing orders."""
    prices = []
    
    for diner in data.get('diners', []):
        for reservation in diner.get('reservations', []):
            for order in reservation.get('orders', []):
                if order.get('item') == item_name:
                    prices.append(order.get('price', 0))
    
    if prices:
        return round(statistics.mean(prices), 2)
    else:
        # Default prices if no examples found
        default_prices = {
            "Beef Bourguignon": 58.0,
            "Boeuf Bourguignon": 58.0,
            "Coq au Vin": 46.0,
            "Duck Confit": 45.0,
            "Rabbit Roulade": 62.0,
            "Salmon en Papillote": 42.0
        }
        return default_prices.get(item_name, 50.0)

def ensure_main_course(data):
    """Ensure every reservation has a main course."""
    appetizers, mains, desserts = categorize_menu_items()
    
    # Create a deep copy to avoid modifying the original data
    augmented_data = copy.deepcopy(data)
    
    for diner in augmented_data.get('diners', []):
        for reservation in diner.get('reservations', []):
            orders = reservation.get('orders', [])
            
            # Check if there's already a main course
            has_main = False
            for order in orders:
                item_name = order.get('item')
                if item_name in mains or item_name == "Chef's Tasting Menu":
                    has_main = True
                    break
            
            # If no main course, add one
            if not has_main and orders:
                # Collect dietary tags from existing orders
                dietary_tags = []
                for order in orders:
                    dietary_tags.extend(order.get('dietary_tags', []))
                dietary_tags = list(set(dietary_tags))  # Remove duplicates
                
                # Select a random main course
                main_course = random.choice(mains)
                
                # Get average price for this main course
                price = get_average_price(data, main_course)
                
                # Add the main course to orders
                orders.append({
                    "item": main_course,
                    "dietary_tags": dietary_tags,
                    "price": price
                })
    
    return augmented_data

def augment_reservations(data):
    """Add timestamps to reservations based on specified rules."""
    # First ensure all reservations have a main course
    augmented_data = ensure_main_course(data)
    
    # Define time slots from 18:00 to 22:00 with 30-minute increments
    time_slots = [f"{h}:{m}" for h in range(18, 23) for m in ["00", "30"] if not (h == 22 and m == "30")]
    
    # Define prime slots (19:00-20:00)
    prime_slots = ["19:00", "19:30", "20:00"]
    
    # Initialize occupancy for each time slot
    slot_occupancy = {slot: 0 for slot in time_slots}
    
    # Collect all reservations
    all_reservations = []
    for diner in augmented_data.get('diners', []):
        for reservation in diner.get('reservations', []):
            # Add reference to the diner for later assignment
            reservation['diner_reference'] = diner
            all_reservations.append(reservation)
    
    # Sort reservations: tasting menu first, then by number of people (descending)
    all_reservations.sort(key=lambda r: (not has_tasting_menu(r), -r.get('number_of_people', 0)))
    
    # Assign time slots
    for reservation in all_reservations:
        assigned = False
        
        # Try to assign tasting menu reservations to prime slots first
        if has_tasting_menu(reservation):
            # Shuffle prime slots to distribute evenly
            random.shuffle(prime_slots)
            for slot in prime_slots:
                if slot_occupancy[slot] + reservation.get('number_of_people', 0) <= 15:
                    reservation['time'] = slot
                    slot_occupancy[slot] += reservation.get('number_of_people', 0)
                    assigned = True
                    break
        
        # If not assigned yet, try all slots in order
        if not assigned:
            for slot in time_slots:
                if slot_occupancy[slot] + reservation.get('number_of_people', 0) <= 15:
                    reservation['time'] = slot
                    slot_occupancy[slot] += reservation.get('number_of_people', 0)
                    assigned = True
                    break
            
            # If still not assigned, find the least occupied slot
            if not assigned:
                least_occupied_slot = min(time_slots, key=lambda s: slot_occupancy[s])
                reservation['time'] = least_occupied_slot
                slot_occupancy[least_occupied_slot] += reservation.get('number_of_people', 0)
        
        # Remove the diner reference
        del reservation['diner_reference']
    
    return augmented_data

def main():
    input_file = "fine-dining-dataset.json"
    output_file = "augmented-fine-dining-dataset.json"
    
    # Load data
    data = load_data(input_file)
    
    # Augment reservations with timestamps
    augmented_data = augment_reservations(data)
    
    # Save augmented data
    save_data(augmented_data, output_file)
    
    print(f"Augmented data saved to {output_file}")
    
    # Print distribution of reservations by time slot
    print("\nReservation distribution by time slot:")
    time_slots = {}
    people_by_slot = {}
    
    for diner in augmented_data.get('diners', []):
        for reservation in diner.get('reservations', []):
            if 'time' in reservation:
                time_slot = reservation['time']
                time_slots[time_slot] = time_slots.get(time_slot, 0) + 1
                people_by_slot[time_slot] = people_by_slot.get(time_slot, 0) + reservation.get('number_of_people', 0)
    
    for slot in sorted(time_slots.keys()):
        print(f"{slot}: {time_slots[slot]} reservations, {people_by_slot[slot]} people")

if __name__ == "__main__":
    main()
