import json

# Load the JSON data
with open('fine-dining-dataset.json', 'r') as file:
    data = json.load(file)

# Create a dictionary to store items and their counts
item_counts = {}

# Extract items from each diner's reservations
for diner in data['diners']:
    for reservation in diner['reservations']:
        for order in reservation['orders']:
            item = order['item']
            if item in item_counts:
                item_counts[item] += 1
            else:
                item_counts[item] = 1

# Print all items and their counts
print(f"Total unique items: {len(item_counts)}")
print("\nItems and their counts:")
for item, count in sorted(item_counts.items()):
    print(f"- {item}: {count}")

# Print the items in alphabetical order
print("\nAll unique items (alphabetical):")
for item in sorted(item_counts.keys()):
    print(f"- {item}")
