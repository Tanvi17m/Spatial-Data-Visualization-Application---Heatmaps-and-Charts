import xml.etree.ElementTree as ET

# Function to normalize points data, handling both space and comma separation
def normalize_points(points_str):
    if ',' in points_str:
        points_list = points_str.replace(',', ' ').split()
    else:
        points_list = points_str.split()
    return [(float(points_list[i]), float(points_list[i + 1])) for i in range(0, len(points_list), 2)]

# Function to parse SVG and return room points mapping
def parse_svg_rooms_from_file(input_file):
    # Read SVG data from file
    with open(input_file, 'r') as file:
        svg_data = file.read()
    
    root = ET.fromstring(svg_data)
    room_info = {}
    for room in root.findall(".//*[@class='room']"):
        room_id = room.attrib['id']
        if room.tag == 'polyline':
            points_str = room.attrib['points']
            points = normalize_points(points_str)
        elif room.tag == 'rect':
            x = float(room.attrib['x'])
            y = float(room.attrib['y'])
            width = float(room.attrib['width'])
            height = float(room.attrib['height'])
            points = [(x, y), (x + width, y), (x + width, y + height), (x, y + height), (x, y)]
        room_info[room_id] = points
    return room_info

# Read from 'input.txt', process SVG, and write results to 'output.txt'
def process_svg_and_write_output(input_file, output_file):
    room_points_mapping = parse_svg_rooms_from_file(input_file)
    with open(output_file, 'w') as out_file:
        for room_id, points in room_points_mapping.items():
            out_file.write(f'{room_id}: {points}\n')

input_file_name = 'xml_room_points_floor3.txt'
output_file_name = 'room_points_floor3_output.txt'

process_svg_and_write_output(input_file_name, output_file_name)
