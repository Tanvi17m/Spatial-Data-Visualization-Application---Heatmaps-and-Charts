import re
import random
import json

with open('coordinates_floor1_public.txt', 'r') as file:
    content = file.read()

pattern = r'<circle id="([^"]+)" cx="([^"]+)" cy="([^"]+)" r="([^"]+)" class="([^"]+)"/>'

# Parsing function to extract circle data from input string
def parse_circle_data(data):
    circles = {}

    matches = re.findall(pattern, data)
    for match in matches:
        id = match[0]
        if not id.endswith('_public'):  
            continue 
        circle_data = {
            "x": int(round(float(match[1])*0.98)) - 45,
            "y": int(round(float(match[2])*0.98)) - 20,
            "value": random.randint(50, 100)  # Random value between 50 and 100
        }
        circles[id] = circle_data
    return circles

# Process the input data
circle_list = parse_circle_data(content)

# Example usage: print all circles' data for IDs ending with '_public'
for key, obj in circle_list.items():
    print(f"Key: {key}, Value: {obj}")

# Write the filtered circle data to a JSON file
with open('mites_coordinates_floor1_public.json', 'w') as json_file:
    json.dump(circle_list, json_file, indent=4)
