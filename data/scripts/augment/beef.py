import json
import os

# Path to your JSON file
file_path = 'augmented-fine-dining-dataset.json'

# Read the file
try:
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
        
    # Make the replacements
    updated_content = content.replace('Beef Bourguignon/Boeuf Bourguignon', 'Beef Bourguignon')
    updated_content = updated_content.replace('Boeuf Bourguignon', 'Beef Bourguignon')
    
    # Write the updated content back to the file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(updated_content)
    
    print('Replacements completed successfully.')
    
except Exception as e:
    print(f'Error: {e}')
