import re
import random
import json

with open('coordinates_floor3_public.txt', 'r') as file:
    content = file.read()

pattern = r'<circle id="([^"]+)" cx="([^"]+)" cy="([^"]+)" r="([^"]+)" class="([^"]+)"/>'

# Parsing function to extract circle data from input string
def parse_circle_data(data):
    circles = {}

    matches = re.findall(pattern, data)
    for match in matches:
        id = match[0]
        circle_data = {
            "x": int(round(float(match[1])*1.6)-110) ,
            "y": int(round(float(match[2])*1.65)-150) ,
            "value": random.randint(50, 100)
        }
        circles[id] = circle_data
    return circles

# Process the input data
circle_list = parse_circle_data(content)

# Example usage: print all circles' data
for key, obj in circle_list.items():
    print(f"Key: {key}, Value: {obj}")

with open('mites_coordinates_floor3_updated.json', 'w') as json_file:
    json.dump(circle_list, json_file, indent=4)