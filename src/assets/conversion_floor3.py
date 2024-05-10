import json

# Replace with the actual paths to your files
input_filename = 'centroids_floor3.json'
output_filename = 'updated_centroids_floor3.json'

# Read the input JSON file
with open(input_filename, 'r') as file:
    data = json.load(file)

for key in data.keys():
    data[key]['x'] = data[key]['x']*0.62 + 70,
    data[key]['y'] = data[key]['y']*0.6 + 90

with open(output_filename, 'w') as file:
    json.dump(data, file, indent=4)

print(f"Processed data has been saved to '{output_filename}'.")
