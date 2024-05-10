import re
import random
import json

# Parsing function to extract circle data from input string
def parse_circle_data():
    coordinates = {}
    k = 1;
    for i in range(40, 900, 30):
        for j in range(40, 500, 30):
            coords = {
                "x": i,
                "y": j,
                "value": 0
            }
            coordinates["Dummy"+str(k)] = coords
            k = k + 1
    return coordinates

# Process the input data
circle_list = parse_circle_data()

# Example usage: print all circles' data
for key, obj in circle_list.items():
    print(f"Key: {key}, Value: {obj}")

with open('dummy_coordinates_floor1.json', 'w') as json_file:
    json.dump(circle_list, json_file, indent=4)