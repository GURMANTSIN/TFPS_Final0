from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import networkx as nx
import math
import os
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)

# Load SCATS data
csv_file_path = 'traffic_network2.csv'
df = pd.read_csv(csv_file_path)

# Initialize the graph
G = nx.DiGraph()

# Add nodes to the graph
for idx, row in df.iterrows():
    G.add_node(row['SCATS Number'], latitude=row['Latitude'], longitude=row['Longitude'], volume=100)

for idx, row in df.iterrows():
    if pd.notna(row['Neighbours']):
        neighbours = str(row['Neighbours']).split(';')
        for neighbour_str in neighbours:
            try:
                neighbour = int(neighbour_str)
                if neighbour in G.nodes:
                    G.add_edge(row['SCATS Number'], neighbour, weight=30)  
            except ValueError:
                continue  

# Function to calculate travel time based on volume and distance
def calculate_travel_time(volume, distance):
    speed_limit = 60 * (1000 / 3600) 
    travel_time = distance / speed_limit + 30 
    travel_time *= (1 + volume / 1000)  
    return travel_time

# Haversine formula to calculate distance
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

@app.route('/get_scats_sites', methods=['GET'])
def get_scats_sites():
    scats_sites = df[['SCATS Number', 'Latitude', 'Longitude']].to_dict(orient='records')
    return jsonify(scats_sites)

# Endpoint to calculate route
@app.route('/calculate_route', methods=['POST'])
def calculate_route():
    data = request.json
    origin = int(data['origin'])
    destination = int(data['destination'])
    model = data['model']  
    date_str = data['date'] 
    time_str = data['time']  

    datetime_str = f"{date_str} {time_str}"
    datetime_obj = datetime.strptime(datetime_str, '%Y-%m-%d %H:%M')

    predictions_folder = 'predictions'

    
    for node in G.nodes:
        scats_number = node
        scats_folder = os.path.join(predictions_folder, str(scats_number))

        file_name = f"{model}_{scats_number}.csv"
        file_path = os.path.join(scats_folder, file_name)

        if os.path.exists(file_path):
            pred_df = pd.read_csv(file_path)
            # Ensure 'Values' column exists
            if 'Values' in pred_df.columns:
                # Compute the index based on time
                total_minutes = datetime_obj.hour * 60 + datetime_obj.minute
                index = total_minutes // 15  # Integer division to get 15-minute interval index (0-95)
                if 0 <= index < len(pred_df):
                    predicted_volume = pred_df['Values'].iloc[index]
                    G.nodes[scats_number]['volume'] = float(predicted_volume)
                else:
                    G.nodes[scats_number]['volume'] = 100  # Default volume if index is out of range
            else:
                G.nodes[scats_number]['volume'] = 100  # Default volume if 'Values' column is missing
        else:
            G.nodes[scats_number]['volume'] = 100  # Default volume if file does not exist

    for u, v in G.edges():
        u_data = G.nodes[u]
        v_data = G.nodes[v]
        lat1, lon1 = u_data['latitude'], u_data['longitude']
        lat2, lon2 = v_data['latitude'], v_data['longitude']
        distance = haversine(lat1, lon1, lat2, lon2)
        volume = u_data['volume']
        travel_time = calculate_travel_time(volume, distance)
        G.edges[u, v]['weight'] = float(travel_time)

    # Find routes
    try:
        paths = []
        for path in nx.shortest_simple_paths(G, origin, destination, weight='weight'):
            path_coords = []
            for node in path:
                node_data = G.nodes[node]
                lat = node_data['latitude']
                lon = node_data['longitude']
                path_coords.append([lat, lon])  # Convert to list for JSON serialization
            total_time = sum(G.edges[path[i], path[i+1]]['weight'] for i in range(len(path) - 1)) / 60  # Convert to minutes
            paths.append({
                'path': path,
                'coordinates': path_coords,
                'total_time': float(total_time)
            })
            if len(paths) >= 5:
                break
        return jsonify(paths)
    except nx.NetworkXNoPath:
        return jsonify({"error": "No path found between the specified SCATS sites."}), 404

if __name__ == '__main__':
    app.run(port=5000, debug=True)
