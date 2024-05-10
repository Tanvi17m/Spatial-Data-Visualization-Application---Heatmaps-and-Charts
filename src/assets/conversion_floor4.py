import json

# Replace with the actual paths to your files
input_filename = 'centroids_floor4.json'
output_filename = 'updated_centroids_floor4.json'

# Read the input JSON file
with open(input_filename, 'r') as file:
    data = json.load(file)

for key in data.keys():
    data[key]['x'] = data[key]['x']*1.32 - 110,
    data[key]['y'] = data[key]['y']*1.32 - 120

with open(output_filename, 'w') as file:
    json.dump(data, file, indent=4)

print(f"Processed data has been saved to '{output_filename}'.")
