import json
from shapely.geometry import Polygon

def process_rooms(input_file_path, output_file_path):
    room_centroids = {}

    with open(input_file_path, 'r') as file:
        for line in file:
            room_id, points_str = line.split(": ")
            points_str = points_str.strip("[]\n")
            points_list = eval(points_str)

            # Handling both flat and nested lists of points
            if isinstance(points_list[0], tuple):
                points = points_list
            else:
                points = [(points_list[i], points_list[i+1][0]) for i in range(0, len(points_list), 2)]

            polygon = Polygon(points)
            centroid = polygon.centroid
            room_centroids[room_id] = {"x": int(round(float(centroid.x)*1.6)-110), "y": int(round(float(centroid.y)*1.65)-150)}

    with open(output_file_path, 'w') as f:
        json.dump(room_centroids, f, indent=4)

    print(f"Centroid data has been written to {output_file_path}")


input_file_path = 'room_points_floor3_output.txt'
output_file_path = 'centroids_floor3.json'

process_rooms(input_file_path, output_file_path)
